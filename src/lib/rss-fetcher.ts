import Parser from 'rss-parser';
import https from 'https';
import http from 'http';
import { prisma } from './prisma';
import { rssSources, type RssSource } from './rss-sources';
import { classifyNews } from './topics';
import { cleanTitle } from './clean-text';
import { BUSHEHR_KEYWORDS } from './bushehr';

import { isRetryableError, backoffMs } from './rss-utils';

export const RSS_FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2; // حداکثر ۲ تلاش مجدد (۳ attempt در مجموع)

export type SourceFetchStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'NO_NEW_ITEMS';

export interface SourceFetchResult {
  source: string;
  status: SourceFetchStatus;
  items: FetchedItem[];
  error?: string;
  attempts: number; // تعداد تلاش‌های انجام‌شده
  retryCount: number;
  durationMs: number;
}

export interface FetchedItem {
  title: string;
  link: string;
  description: string;
  image: string;
  source: string;
  sourceName: string;
  publishedAt: Date | null;
}

export interface FetchSummary {
  saved: number;
  newItems: number;
  updatedItems: number;
  totalSources: number;
  successSources: number;
  failedSources: number;
  results: SourceFetchResult[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const parser = new Parser({
  timeout: RSS_FETCH_TIMEOUT_MS,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

function fetchUrlFollowingRedirects(url: string, maxRedirects = 5, timeoutMs: number = RSS_FETCH_TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: timeoutMs, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        fetchUrlFollowingRedirects(loc, maxRedirects - 1, timeoutMs).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode && res.statusCode >= 400) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
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

// دریافت یک سورس با retry محدود فقط برای خطاهای موقت
export async function fetchSourceWithRetry(source: RssSource, timeoutMs: number = RSS_FETCH_TIMEOUT_MS): Promise<SourceFetchResult> {
  const t0 = Date.now();
  let lastError = '';
  let attempts = 0;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    attempts = attempt + 1;
    try {
      const xml = await fetchUrlFollowingRedirects(source.url, 5, timeoutMs);
      let feed: { items: any[] };
      try {
        feed = await parser.parseString(xml);
      } catch {
        throw new Error('parse-error');
      }
      const items: FetchedItem[] = [];
      for (const item of (feed.items || []).slice(0, 15)) {
        if (!item.title || !item.link) continue;
        items.push({
          title: cleanTitle(item.title),
          link: item.link,
          description: extractDescription(item as Record<string, unknown>),
          image: extractImage(item as Record<string, unknown>) || '',
          source: source.name,
          sourceName: source.name,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        });
      }
      const durationMs = Date.now() - t0;
      if (items.length === 0) {
        return { source: source.name, status: 'NO_NEW_ITEMS', items, attempts, retryCount: attempt, durationMs };
      }
      return { source: source.name, status: 'SUCCESS', items, attempts, retryCount: attempt, durationMs };
    } catch (e: any) {
      lastError = String(e?.message || e).slice(0, 200);
      if (attempt < MAX_RETRIES && isRetryableError(lastError)) {
        await sleep(backoffMs(attempt));
        continue;
      }
      break;
    }
  }
  const durationMs = Date.now() - t0;
  const status: SourceFetchStatus = /timeout|timed out|etimedout/i.test(lastError) ? 'TIMEOUT' : 'FAILED';
  return { source: source.name, status, items: [], error: lastError, attempts, retryCount: Math.max(0, attempts - 1), durationMs };
}

async function ensureRssLogTables(): Promise<void> {
  // خودترمیم جدول‌ها (قرارداد رپو: DDL در runtime، مثل ماژول روزنامه‌ها)
  const ddl = [
    `CREATE TABLE IF NOT EXISTS "RssFetchLog" ("id" TEXT NOT NULL, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "finishedAt" TIMESTAMP(3), "durationMs" INTEGER, "status" TEXT NOT NULL DEFAULT 'RUNNING', "totalSources" INTEGER NOT NULL DEFAULT 0, "successSources" INTEGER NOT NULL DEFAULT 0, "failedSources" INTEGER NOT NULL DEFAULT 0, "newItems" INTEGER NOT NULL DEFAULT 0, "updatedItems" INTEGER NOT NULL DEFAULT 0, "errorSummary" TEXT, "triggerType" TEXT NOT NULL DEFAULT 'manual', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RssFetchLog_pkey" PRIMARY KEY ("id"))`,
    `CREATE TABLE IF NOT EXISTS "RssFetchSourceLog" ("id" TEXT NOT NULL, "fetchLogId" TEXT NOT NULL, "source" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "finishedAt" TIMESTAMP(3), "durationMs" INTEGER, "fetchedCount" INTEGER NOT NULL DEFAULT 0, "newCount" INTEGER NOT NULL DEFAULT 0, "error" TEXT, "retryCount" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "RssFetchSourceLog_pkey" PRIMARY KEY ("id"))`,
    `CREATE INDEX IF NOT EXISTS "RssFetchLog_createdAt_idx" ON "RssFetchLog"("createdAt")`,
    `CREATE INDEX IF NOT EXISTS "RssFetchSourceLog_fetchLogId_idx" ON "RssFetchSourceLog"("fetchLogId")`,
  ];
  for (const sql of ddl) {
    try { await prisma.$executeRawUnsafe(sql); } catch {}
  }
}

export interface FetchAllOptions {
  sources?: RssSource[];
  timeoutMs?: number;
  triggerType?: string;
  logId?: string; // اگر از قبل ساخته شده
}

export async function fetchAllRssFeeds(opts: FetchAllOptions = {}): Promise<FetchSummary> {
  const list = opts.sources || rssSources;
  const timeoutMs = opts.timeoutMs || RSS_FETCH_TIMEOUT_MS;
  const t0 = Date.now();
  await ensureRssLogTables();

  const log = opts.logId
    ? { id: opts.logId }
    : await prisma.rssFetchLog.create({
        data: { status: 'RUNNING', totalSources: list.length, triggerType: opts.triggerType || 'manual' },
      }).catch(() => null);

  // همه سورس‌ها موازی؛ خرابی یکی بقیه را متوقف نمی‌کند
  const results = await Promise.allSettled(
    list.map((source) => fetchSourceWithRetry(source, timeoutMs))
  );

  const settled: SourceFetchResult[] = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { source: list[i].name, status: 'FAILED' as const, items: [], error: 'allSettled-rejected', attempts: 1, retryCount: 0, durationMs: 0 }
  );

  let saved = 0;
  let newItems = 0;
  let updatedItems = 0;
  const newBySource: Record<string, number> = {};
  for (const sr of settled) {
    let created = 0;
    for (const news of sr.items) {
      try {
        const sourceDef = rssSources.find(s => s.name === news.sourceName);
        const isBushehrSource = sourceDef?.category === 'بوشهر';
        const isBushehr = isBushehrSource || BUSHEHR_KEYWORDS.test(news.title) || BUSHEHR_KEYWORDS.test(news.description);
        // دسته خود منبع حفظ می‌شود (مثل «روزنامه»)؛ فقط خبر بوشهری به تب بوشهر می‌رود
        const category = isBushehr ? 'بوشهر' : (sourceDef?.category || 'ملی');

        const existing = await prisma.externalNews.findUnique({
          where: { link: news.link },
          select: { id: true, status: true },
        });

        // خبر روزنامه بدون نیاز به تایید مدیر منتشر می‌شود
        const autoApprove = category === 'روزنامه';

        if (existing) {
          if (existing.status !== 'APPROVED' && existing.status !== 'REJECTED') {
            await prisma.externalNews.update({
              where: { id: existing.id },
              data: { title: news.title, description: news.description, image: news.image, publishedAt: news.publishedAt, category, topic: classifyNews(news.title, news.description), fetchedAt: new Date(), ...(autoApprove ? { status: 'APPROVED' as const } : {}) },
            });
          } else {
            await prisma.externalNews.update({
              where: { id: existing.id },
              data: { category, topic: classifyNews(news.title, news.description), fetchedAt: new Date() },
            });
          }
          updatedItems++;
        } else {
          await prisma.externalNews.create({
            data: {
              title: news.title, link: news.link, description: news.description, image: news.image,
              source: news.source, sourceName: news.sourceName, category, status: autoApprove ? 'APPROVED' : 'PENDING', publishedAt: news.publishedAt,
              topic: classifyNews(news.title, news.description),
            },
          });
          newItems++;
          created++;
        }
        saved++;
      } catch {
        // skip duplicates
      }
    }
    newBySource[sr.source] = created;
  }

  const successSources = settled.filter((r) => r.status === 'SUCCESS' || r.status === 'NO_NEW_ITEMS').length;
  const failedSources = settled.length - successSources;
  // لاگ سطح سورس (best-effort؛ خرابی لاگ نباید fetch را خراب کند)
  if (log) {
    for (const sr of settled) {
      await prisma.rssFetchSourceLog.create({
        data: {
          fetchLogId: log.id, source: sr.source, status: sr.status,
          finishedAt: new Date(), durationMs: sr.durationMs,
          fetchedCount: sr.items.length, newCount: newBySource[sr.source] || 0,
          error: sr.error?.slice(0, 500), retryCount: sr.retryCount,
        },
      }).catch(() => {});
    }
    const failed = settled.filter((r) => r.status === 'FAILED' || r.status === 'TIMEOUT');
    await prisma.rssFetchLog.update({
      where: { id: log.id },
      data: {
        finishedAt: new Date(),
        durationMs: Date.now() - t0,
        status: failedSources === 0 ? 'SUCCESS' : (successSources === 0 ? 'FAILED' : 'PARTIAL'),
        successSources, failedSources, newItems, updatedItems,
        errorSummary: failed.length ? failed.slice(0, 10).map((f) => `${f.source}: ${f.error || f.status}`).join(' | ').slice(0, 1000) : null,
      },
    }).catch(() => {});
  }

  return { saved, newItems, updatedItems, totalSources: settled.length, successSources, failedSources, results: settled };
}

// نگهداری مستقل (خارج از مسیر Fetch): پاکسازی عناوین انگلیسی قدیمی
export async function runRssMaintenance(maxBatches = 5): Promise<{ fixed: number }> {
  const MAX_CLEAN_PER_BATCH = 100;
  let fixed = 0;
  for (let b = 0; b < maxBatches; b++) {
    const rows = await prisma.externalNews.findMany({
      select: { id: true, title: true },
      orderBy: { fetchedAt: 'asc' },
      take: 1000,
    });
    let batchFixed = 0;
    for (const row of rows) {
      if (batchFixed >= MAX_CLEAN_PER_BATCH) break;
      if (!/[A-Za-z]/.test(row.title)) continue;
      const cleaned = cleanTitle(row.title);
      if (cleaned && cleaned !== row.title) {
        await prisma.externalNews.update({ where: { id: row.id }, data: { title: cleaned } });
        batchFixed++;
      }
    }
    fixed += batchFixed;
    if (batchFixed < MAX_CLEAN_PER_BATCH) break;
  }
  return { fixed };
}
