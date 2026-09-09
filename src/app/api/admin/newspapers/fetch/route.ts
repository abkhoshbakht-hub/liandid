import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchPaperDay, fetchAllPapers } from '@/lib/newspapers/fetcher';
import { ensureDefaultSources } from '@/lib/newspapers/ensure';
import { tehranToday } from '@/lib/newspapers/date';
import { getAdapter, downloadCandidate, debugTelegramPage } from '@/lib/newspapers/adapters';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

// POST { newspaperId? } → اجرای دریافت (تکی یا همه)
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    try { await ensureDefaultSources(); } catch {}
    const day = tehranToday();
    if (body.newspaperId) {
      const paper = await prisma.newspaper.findUnique({ where: { id: body.newspaperId } });
      if (!paper) return NextResponse.json({ success: false, message: 'روزنامه یافت نشد' }, { status: 404 });
      const r = await fetchPaperDay(paper, day);
      return NextResponse.json({ success: r.ok, data: r });
    }
    const results = await fetchAllPapers(day);
    const ok = results.filter((r) => r.ok && r.status !== 'SKIPPED').length;
    const failed = results.filter((r) => !r.ok).length;
    return NextResponse.json({ success: true, data: { date: day.persian, ok, failed, results } });
  } catch (e: any) {
    console.error('Manual newspapers fetch error:', e);
    return NextResponse.json({ success: false, message: 'ERR: ' + String(e?.message || e).slice(0, 300) }, { status: 500 });
  }
}

// GET ?testSource=<id> → تست خشک یک سورس (بدون ذخیره)
export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  }
  const sourceId = new URL(req.url).searchParams.get('testSource');
  if (!sourceId) return NextResponse.json({ success: false, message: 'testSource لازم است' }, { status: 400 });
  let debug: any = null;
  try {
    const src = await prisma.newspaperSource.findUnique({ where: { id: sourceId }, include: { newspaper: true } });
    if (!src) return NextResponse.json({ success: false, message: 'سورس یافت نشد' }, { status: 404 });
    const t0 = Date.now();
    if (src.type === 'telegram') {
      debug = await debugTelegramPage(src as any);
    }
    const adapter = getAdapter(src.type);
    const candidate = await adapter.fetchCandidate(src as any, src.newspaper as any, tehranToday());
    let dims: { width: number; height: number } | null = null;
    try {
      const img = await downloadCandidate(candidate);
      dims = { width: img.width, height: img.height };
    } catch (e: any) {
      return NextResponse.json({
        success: true,
        data: { ok: false, stage: 'download', imageUrl: candidate.imageUrl, error: String(e?.message || e), debug, ms: Date.now() - t0 },
      });
    }
    return NextResponse.json({
      success: true,
      data: { ok: true, imageUrl: candidate.imageUrl, pageUrl: candidate.pageUrl, title: candidate.title, evidence: candidate.evidence, dims, debug, ms: Date.now() - t0 },
    });
  } catch (e: any) {
    return NextResponse.json({ success: true, data: { ok: false, stage: 'discover', error: String(e?.message || e).slice(0, 300), debug } });
  }
}
