import { prisma } from '@/lib/prisma';
import { tehranToday, type TehranDay } from './date';
import { downloadCandidate, getAdapter, type CoverCandidate } from './adapters';
import { processCover, sleep, type DownloadedImage } from './image';
import { getCoverStorage } from './storage';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;
const BETWEEN_PAPERS_MS = 1000;
// حداقل عرض قابل‌قبول برای ذخیره فوری؛ کمتر از این فقط اگر سورس دیگری جواب نداد ذخیره می‌شود
const MIN_GOOD_WIDTH = 600;

export interface FetchOutcome {
  newspaperId: string;
  name: string;
  ok: boolean;
  status: string;
  issueId?: string;
  confidence?: number;
  error?: string;
}

function scoreCandidate(c: CoverCandidate, img: DownloadedImage, paperName: string): number {
  let s = 0;
  if (c.evidence.dateMatch) s += 40;
  if (c.evidence.nameMatch || (c.title || '').includes(paperName)) s += 25;
  if (c.evidence.official) s += 20;
  // ابعاد معتبر جلد: حداقل ۵۰۰px و ترجیحاً عمودی
  if (img.width >= 500 && img.height >= 600) s += 10;
  else if (img.width >= 300) s += 4;
  const ratio = img.width / img.height;
  if (ratio >= 0.5 && ratio <= 1.1) s += 5; // پرتره مثل جلد واقعی
  // تصویر افقی (مثل پیش‌نمایش دوصفحه‌ای) هرگز جلد قطعی نیست → سقف نیاز به بررسی
  if (ratio > 1.1) return Math.min(s, 69);
  return Math.min(100, s);
}

async function logAttempt(data: {
  newspaperId?: string;
  sourceId?: string;
  status: string;
  httpStatus?: number;
  errorMessage?: string;
  discoveredImageUrl?: string;
  discoveredDate?: string;
  responseTimeMs?: number;
}) {
  try {
    await prisma.newspaperFetchLog.create({
      data: {
        newspaperId: data.newspaperId,
        sourceId: data.sourceId,
        finishedAt: new Date(),
        status: data.status,
        httpStatus: data.httpStatus,
        errorMessage: data.errorMessage?.slice(0, 1000),
        discoveredImageUrl: data.discoveredImageUrl?.slice(0, 1000),
        discoveredDate: data.discoveredDate?.slice(0, 100),
        responseTimeMs: data.responseTimeMs,
      },
    });
  } catch {}
}

export async function fetchPaperDay(
  paper: { id: string; name: string; slug: string; website: string | null },
  day: TehranDay = tehranToday()
): Promise<FetchOutcome> {
  // اگر امروز قبلاً شماره دارد → رد
  const existing = await prisma.newspaperIssue.findUnique({
    where: { newspaperId_date: { newspaperId: paper.id, date: day.utcMidnight } },
  });
  if (existing) {
    await logAttempt({ newspaperId: paper.id, status: 'SKIPPED', errorMessage: 'issue-exists' });
    return { newspaperId: paper.id, name: paper.name, ok: true, status: 'SKIPPED', issueId: existing.id };
  }

  const sources = await prisma.newspaperSource.findMany({
    where: { newspaperId: paper.id, active: true, NOT: { type: 'manual' } },
    orderBy: { priority: 'asc' },
  });
  if (sources.length === 0) {
    await logAttempt({ newspaperId: paper.id, status: 'SKIPPED', errorMessage: 'no-active-source' });
    return { newspaperId: paper.id, name: paper.name, ok: false, status: 'NO_SOURCE', error: 'سورس فعالی تنظیم نشده' };
  }

  let lastError = 'unknown';
  // خطای دسترسی (منبع پایین است) در برابر منبعِ در دسترسِ بدون جلد امروز
  const ACCESS_ERR = /HTTP \d+|timeout|abort|blocked|not-allowed|fetch failed|ECONN|ENOTFOUND|ETIMEDOUT|404|502|503|network/i;
  let anyReachable = false;
  let lowQuality: { candidate: CoverCandidate; img: DownloadedImage; srcId: string } | null = null;
  const saveIssue = async (candidate: CoverCandidate, img: DownloadedImage, srcId: string, capped: boolean) => {
    await processCover(img.buffer);
    const storage = getCoverStorage();
    const coverUrl = await storage.save(img.buffer, { paperSlug: paper.slug, date: day.key, kind: 'original', mime: img.mime });
    const confidence = capped ? Math.min(scoreCandidate(candidate, img, paper.name), 69) : scoreCandidate(candidate, img, paper.name);
    const status = confidence >= 90 ? 'PUBLISHED' : 'NEEDS_REVIEW';
    const issue = await prisma.newspaperIssue.create({
          data: {
            newspaperId: paper.id,
            date: day.utcMidnight,
            persianDate: day.persian,
            title: candidate.title?.slice(0, 300),
            issueNumber: candidate.issueNumber?.slice(0, 50) || undefined,
        originalUrl: candidate.pageUrl.slice(0, 1000),
        imageUrl: coverUrl,
        thumbnailUrl: coverUrl,
        sourceId: srcId,
        imageHash: img.hash,
        confidence,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });
    await prisma.newspaperSource.update({ where: { id: srcId }, data: { lastSuccessAt: new Date() } }).catch(() => {});
    return issue;
  };
  for (const src of sources) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const t0 = Date.now();
      try {
        const adapter = getAdapter(src.type);
        const candidate = await adapter.fetchCandidate(src as any, paper as any, day);
        const img = await downloadCandidate(candidate);
        // کیفیت پایین؟ سورس بعدی را امتحان کن؛ اگر هیچ سورس خوبی نبود همین ذخیره می‌شود
        if (img.width < MIN_GOOD_WIDTH) {
          anyReachable = true;
          if (!lowQuality || img.width > lowQuality.img.width) {
            lowQuality = { candidate, img, srcId: src.id };
          }
          await logAttempt({ newspaperId: paper.id, sourceId: src.id, status: 'FAILED', errorMessage: `attempt${attempt}: low-quality(${img.width}x${img.height})`, responseTimeMs: Date.now() - t0 });
          lastError = `کیفیت پایین (${img.width}×${img.height})`;
          break; // سورس بعدی
        }
        // تکراری؟ (هش با شماره‌های قبلی همین روزنامه)
        const dup = await prisma.newspaperIssue.findFirst({
          where: { newspaperId: paper.id, imageHash: img.hash },
          select: { id: true },
        });
        if (dup) {
          anyReachable = true;
          await logAttempt({ newspaperId: paper.id, sourceId: src.id, status: 'DUPLICATE', discoveredImageUrl: candidate.imageUrl, responseTimeMs: Date.now() - t0 });
          lastError = 'تصویر تکراری است';
          break; // سورس بعدی
        }

        const issue = await saveIssue(candidate, img, src.id, false);
        await logAttempt({ newspaperId: paper.id, sourceId: src.id, status: 'SUCCESS', discoveredImageUrl: candidate.imageUrl, discoveredDate: candidate.discoveredDate, responseTimeMs: Date.now() - t0 });
        return { newspaperId: paper.id, name: paper.name, ok: true, status: issue.status, issueId: issue.id, confidence: issue.confidence };
      } catch (e: any) {
        lastError = String(e?.message || e).slice(0, 300);
        if (!ACCESS_ERR.test(lastError)) anyReachable = true; // منبع جواب داد ولی جلد امروز را نداشت
        const httpStatus = /HTTP (\d+)/.exec(lastError)?.[1];
        await prisma.newspaperSource.update({ where: { id: src.id }, data: { lastFailureAt: new Date() } }).catch(() => {});
        await logAttempt({
          newspaperId: paper.id, sourceId: src.id, status: 'FAILED',
          httpStatus: httpStatus ? Number(httpStatus) : undefined,
          errorMessage: `attempt${attempt}: ${lastError}`, responseTimeMs: Date.now() - t0,
        });
        if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  // هیچ سورس باکیفیتی جواب نداد ولی یک تصویر کم‌کیفیت داریم → همان را با سقف امتیاز ذخیره کن
  if (lowQuality) {
    try {
      const dupFb = await prisma.newspaperIssue.findFirst({
        where: { newspaperId: paper.id, imageHash: lowQuality.img.hash },
        select: { id: true },
      });
      if (dupFb) return { newspaperId: paper.id, name: paper.name, ok: false, status: 'NOT_PUBLISHED', error: 'تصویر تکراری است' };
      const issue = await saveIssue(lowQuality.candidate, lowQuality.img, lowQuality.srcId, true);
      await logAttempt({ newspaperId: paper.id, sourceId: lowQuality.srcId, status: 'SUCCESS', errorMessage: 'low-quality-fallback', discoveredImageUrl: lowQuality.candidate.imageUrl });
      return { newspaperId: paper.id, name: paper.name, ok: true, status: issue.status, issueId: issue.id, confidence: issue.confidence };
    } catch {
      lastError = 'fallback-save-failed';
    }
  }
  // همه سورس‌ها ناموفق: منبع در دسترس ولی بدون جلد امروز → NOT_PUBLISHED؛
  // هیچ منبعی در دسترس نبود → SOURCE_UNAVAILABLE (نه قضاوت درباره انتشار)
  return { newspaperId: paper.id, name: paper.name, ok: false, status: anyReachable ? 'NOT_PUBLISHED' : 'SOURCE_UNAVAILABLE', error: lastError };
}

export async function fetchAllPapers(day: TehranDay = tehranToday(), concurrency = 4): Promise<FetchOutcome[]> {
  const papers = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } });
  const out: FetchOutcome[] = new Array(papers.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= papers.length) return;
      const p = papers[i];
      try {
        out[i] = await fetchPaperDay(p, day);
      } catch (e: any) {
        out[i] = { newspaperId: p.id, name: p.name, ok: false, status: 'FAILED', error: String(e?.message || e).slice(0, 200) };
      }
      await sleep(BETWEEN_PAPERS_MS);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, papers.length) }, () => worker()));
  return out;
}
