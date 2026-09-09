import { prisma } from '@/lib/prisma';
import { tehranToday, type TehranDay } from './date';
import { downloadCandidate, getAdapter, type CoverCandidate } from './adapters';
import { processCover, sleep, type DownloadedImage } from './image';
import { getCoverStorage } from './storage';

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 4000;
const BETWEEN_PAPERS_MS = 1500;

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
  for (const src of sources) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const t0 = Date.now();
      try {
        const adapter = getAdapter(src.type);
        const candidate = await adapter.fetchCandidate(src as any, paper as any, day);
        const img = await downloadCandidate(candidate);

        // تکراری؟ (هش با شماره‌های قبلی همین روزنامه)
        const dup = await prisma.newspaperIssue.findFirst({
          where: { newspaperId: paper.id, imageHash: img.hash },
          select: { id: true },
        });
        if (dup) {
          await logAttempt({ newspaperId: paper.id, sourceId: src.id, status: 'DUPLICATE', discoveredImageUrl: candidate.imageUrl, responseTimeMs: Date.now() - t0 });
          lastError = 'تصویر تکراری است';
          break; // سورس بعدی
        }

        const confidence = scoreCandidate(candidate, img, paper.name);
        const status = confidence >= 90 ? 'PUBLISHED' : 'NEEDS_REVIEW';

        const { web, thumb } = await processCover(img.buffer);
        const storage = getCoverStorage();
        const datePath = day.key;
        const [originalUrl, webUrl, thumbUrl] = await Promise.all([
          storage.save(img.buffer, { paperSlug: paper.slug, date: datePath, kind: 'original', mime: img.mime }),
          storage.save(web, { paperSlug: paper.slug, date: datePath, kind: 'web', mime: 'image/webp' }),
          storage.save(thumb, { paperSlug: paper.slug, date: datePath, kind: 'thumb', mime: 'image/webp' }),
        ]);

        const issue = await prisma.newspaperIssue.create({
          data: {
            newspaperId: paper.id,
            date: day.utcMidnight,
            persianDate: day.persian,
            title: candidate.title?.slice(0, 300),
            originalUrl: candidate.pageUrl.slice(0, 1000),
            imageUrl: webUrl,
            thumbnailUrl: thumbUrl,
            sourceId: src.id,
            imageHash: img.hash,
            confidence,
            status,
            publishedAt: status === 'PUBLISHED' ? new Date() : null,
          },
        });
        await prisma.newspaperSource.update({ where: { id: src.id }, data: { lastSuccessAt: new Date() } });
        await logAttempt({ newspaperId: paper.id, sourceId: src.id, status: 'SUCCESS', discoveredImageUrl: candidate.imageUrl, discoveredDate: candidate.discoveredDate, responseTimeMs: Date.now() - t0 });
        return { newspaperId: paper.id, name: paper.name, ok: true, status, issueId: issue.id, confidence };
      } catch (e: any) {
        lastError = String(e?.message || e).slice(0, 300);
        const httpStatus = /HTTP (\d+)/.exec(lastError)?.[1];
        await prisma.newspaperSource.update({ where: { id: src.id }, data: { lastFailureAt: new Date() } }).catch(() => {});
        await logAttempt({
          newspaperId: paper.id, sourceId: src.id, status: 'FAILED',
          httpStatus: httpStatus ? Number(httpStatus) : undefined,
          errorMessage: `attempt${attempt}: ${lastError}`, responseTimeMs: Date.now() - t0,
        });
        if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
      }
    }
  }
  return { newspaperId: paper.id, name: paper.name, ok: false, status: 'FAILED', error: lastError };
}

export async function fetchAllPapers(day: TehranDay = tehranToday()): Promise<FetchOutcome[]> {
  const papers = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } });
  const out: FetchOutcome[] = [];
  for (const p of papers) {
    try {
      out.push(await fetchPaperDay(p, day));
    } catch (e: any) {
      out.push({ newspaperId: p.id, name: p.name, ok: false, status: 'FAILED', error: String(e?.message || e).slice(0, 200) });
    }
    await sleep(BETWEEN_PAPERS_MS);
  }
  return out;
}
