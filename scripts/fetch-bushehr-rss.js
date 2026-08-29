const { PrismaClient } = require('@prisma/client');

const https = require('https');
const http = require('http');

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return fetchUrl(loc, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractImageFromContent(content) {
  const imgMatches = content.match(/<img[^>]+src="([^"]+)"/gi) || [];
  for (const match of imgMatches) {
    const srcMatch = match.match(/src="([^"]+)"/i);
    if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('data:') && !srcMatch[1].includes('gravatar') && !srcMatch[1].includes('icon') && !srcMatch[1].includes('logo')) {
      return srcMatch[1];
    }
  }
  return '';
}

function parseRssManual(xml) {
  const items = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of blocks) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };
    const enc = (block.match(/<enclosure[^>]+url="([^"]+)"/i) || [])[1] || '';
    const content = get('content:encoded') || get('content') || get('description') || '';
    const img = enc || extractImageFromContent(content);
    items.push({
      title: get('title'),
      description: get('description').replace(/<[^>]+>/g, '').trim().substring(0, 300),
      link: get('link'),
      image: img,
      pubDate: get('pubDate'),
    });
  }
  return items;
}

const prisma = new PrismaClient();

const feeds = [
  { name: 'بوشهر خبر', url: 'https://bushehrkhabar.com/feed/', category: 'بوشهر' },
  { name: 'بوشهر نیوز', url: 'https://bushehrnews.ir/feed/', category: 'بوشهر' },
  { name: 'پی جی نیوز', url: 'https://www.pgnews.ir/feed/', category: 'بوشهر' },
  { name: 'ایرنا', url: 'https://www.irna.ir/rss', category: 'ملی' },
  { name: 'ایسنا', url: 'https://www.isna.ir/rss', category: 'ملی' },
  { name: 'مهر', url: 'https://www.mehrnews.com/rss', category: 'ملی' },
];

const BUSHEHR_KEYWORDS = /بوشهر|پارس جنوبی|عسلویه|کنگان|گناوه|دیر|تنگستان|دیلم|خارگ|برازجان|دشتی|دشتستان|انارستان|چاه‌مبارک|سیراف|اهرم|نخل تقی|پارسیان|پالایشگاه|پتروشیمی|south pars/i;

async function main() {
  let totalSaved = 0;
  let totalBushehr = 0;

  for (const source of feeds) {
    try {
      console.log(`Fetching ${source.name}...`);
      const xml = await fetchUrl(source.url);
      const items = parseRssManual(xml);
      console.log(`  Got ${items.length} items`);
      
      for (const item of items) {
        if (!item.title || !item.link) continue;
        
        const isBushehrSource = source.category === 'بوشهر';
        const isBushehrContent = BUSHEHR_KEYWORDS.test(item.title) || BUSHEHR_KEYWORDS.test(item.description);
        
        if (!isBushehrSource && !isBushehrContent) continue;
        
        totalBushehr++;
        const hasImage = item.image && item.image.length > 10;
        
        try {
          const existing = await prisma.externalNews.findUnique({
            where: { link: item.link },
            select: { id: true },
          });
          
          if (!existing) {
            await prisma.externalNews.create({
              data: {
                title: item.title,
                link: item.link,
                description: item.description,
                image: item.image || '',
                source: isBushehrSource ? 'bushehr-rss' : 'national-rss',
                sourceName: source.name,
                status: 'APPROVED',
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                fetchedAt: new Date(),
              },
            });
            totalSaved++;
            console.log(`  + [${hasImage ? 'IMG' : '---'}] ${item.title.substring(0, 50)}`);
          }
        } catch (e) {
          // skip duplicates
        }
      }
    } catch (e) {
      console.log(`  FAIL: ${e.message.substring(0, 60)}`);
    }
  }

  console.log(`\nTotal Bushehr matches: ${totalBushehr}`);
  console.log(`Total saved: ${totalSaved}`);
  
  const total = await prisma.externalNews.count();
  const bushehrTotal = await prisma.externalNews.count({
    where: { source: 'bushehr-rss' }
  });
  console.log(`Total in DB: ${total} (${bushehrTotal} from bushehr RSS)`);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
