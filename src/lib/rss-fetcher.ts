import Parser from 'rss-parser';
import https from 'https';
import http from 'http';
import { prisma } from './prisma';
import { rssSources, rssFallbackSources, type RssSource } from './rss-sources';
import { classifyNews } from './topics';

const BUSHEHR_KEYWORDS = /بوشهر(ی|ستان)?|عسلویه|کنگان(ی)?|گناوه(ای)?|(?<![مد])دیر(?!کل|یت|عامل|ان|انه)|تنگستان(ی)?|دیلم(ی)?|خارگ(ی)?|برازجان(ی)?|دشتی|دشتستان(ی)?|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف(ی)?|اهرم(ی)?|چاه‌مبارک|پارسیان(ی)?/i;

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

function fetchUrlFollowingRedirects(url: string, maxRedirects = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        fetchUrlFollowingRedirects(loc, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', (chunk: Buffer) => data += chunk.toString());
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractImage(item: Record<string, unknown>): string | undefined {
  // enclosure
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.toString().startsWith('image')) {
    return enclosure.url;
  }

  // media:content
  const mediaContent = item['media:content'] as { $attrs?: { url?: string } } | undefined;
  if (mediaContent?.$attrs?.url) return mediaContent.$attrs.url;

  // media:thumbnail
  const mediaThumbnail = item['media:thumbnail'] as { $attrs?: { url?: string } } | undefined;
  if (mediaThumbnail?.$attrs?.url) return mediaThumbnail.$attrs.url;

  // Extract from content/description HTML - look for first image with valid src
  const content = (item['content:encoded'] || item.content || item.description || '') as string;
  const imgMatches = content.match(/<img[^>]+src="([^"]+)"/gi) || [];
  for (const match of imgMatches) {
    const srcMatch = match.match(/src="([^"]+)"/i);
    if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('data:') && !srcMatch[1].includes('gravatar') && !srcMatch[1].includes('icon') && !srcMatch[1].includes('logo')) {
      return srcMatch[1];
    }
  }

  return undefined;
}

function extractDescription(item: Record<string, unknown>): string {
  const raw = (item.contentSnippet || item.content || item.description || '') as string;
  // Strip HTML tags
  return raw.replace(/<[^>]*>/g, '').trim().slice(0, 300);
}

async function fetchSource(source: RssSource): Promise<{ title: string; link: string; description: string; image: string; source: string; sourceName: string; publishedAt: Date | null }[]> {
  const results: { title: string; link: string; description: string; image: string; source: string; sourceName: string; publishedAt: Date | null }[] = [];

  try {
    const xml = await fetchUrlFollowingRedirects(source.url);
    const feed = await parser.parseString(xml);
    for (const item of feed.items.slice(0, 15)) {
      if (!item.title || !item.link) continue;
      results.push({
        title: item.title,
        link: item.link,
        description: extractDescription(item as Record<string, unknown>),
        image: extractImage(item as Record<string, unknown>) || '',
        source: source.name,
        sourceName: source.name,
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
      });
    }
  } catch {
    // Try fallback URL
    const fallback = rssFallbackSources.find(f => f.name === source.name);
    if (fallback) {
      try {
        const xml = await fetchUrlFollowingRedirects(fallback.url);
        const feed = await parser.parseString(xml);
        for (const item of feed.items.slice(0, 15)) {
          if (!item.title || !item.link) continue;
          results.push({
            title: item.title,
            link: item.link,
            description: extractDescription(item as Record<string, unknown>),
            image: extractImage(item as Record<string, unknown>) || '',
            source: source.name,
            sourceName: source.name,
            publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          });
        }
      } catch {
        // silently skip failed sources
      }
    }
  }

  return results;
}

export async function fetchAllRssFeeds(): Promise<number> {
  const allNews: { title: string; link: string; description: string; image: string; source: string; sourceName: string; publishedAt: Date | null }[] = [];

  const results = await Promise.allSettled(
    rssSources.map(source => fetchSource(source))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  }

  let saved = 0;
  for (const news of allNews) {
    try {
      const isBushehrSource = rssSources.some(s => s.name === news.sourceName && s.category === 'بوشهر');
      const category = isBushehrSource || BUSHEHR_KEYWORDS.test(news.title) || BUSHEHR_KEYWORDS.test(news.description) ? 'بوشهر' : 'ملی';

      const existing = await prisma.externalNews.findUnique({
        where: { link: news.link },
        select: { id: true, status: true },
      });

      if (existing) {
        if (existing.status !== 'APPROVED' && existing.status !== 'REJECTED') {
          await prisma.externalNews.update({
            where: { id: existing.id },
            data: { title: news.title, description: news.description, image: news.image, publishedAt: news.publishedAt, category, topic: classifyNews(news.title, news.description), fetchedAt: new Date() },
          });
        } else {
          await prisma.externalNews.update({
            where: { id: existing.id },
            data: { category, topic: classifyNews(news.title, news.description), fetchedAt: new Date() },
          });
        }
      } else {
        await prisma.externalNews.create({
          data: {
            title: news.title, link: news.link, description: news.description, image: news.image,
            source: news.source, sourceName: news.sourceName, category, status: 'APPROVED', publishedAt: news.publishedAt,
            topic: classifyNews(news.title, news.description),
          },
        });
      }
      saved++;
    } catch {
      // skip duplicates
    }
  }

  return saved;
}
