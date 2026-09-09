import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchPaperDay, fetchAllPapers } from '@/lib/newspapers/fetcher';
import { tehranToday } from '@/lib/newspapers/date';
import { getAdapter, downloadCandidate } from '@/lib/newspapers/adapters';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

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
  } catch (e) {
    console.error('Manual newspapers fetch error:', e);
    return NextResponse.json({ success: false, message: 'خطا در دریافت' }, { status: 500 });
  }
}

// GET ?testSource=<id> → تست خشک یک سورس (بدون ذخیره)
export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  }
  const sourceId = new URL(req.url).searchParams.get('testSource');
  if (!sourceId) return NextResponse.json({ success: false, message: 'testSource لازم است' }, { status: 400 });
  try {
    const src = await prisma.newspaperSource.findUnique({ where: { id: sourceId }, include: { newspaper: true } });
    if (!src) return NextResponse.json({ success: false, message: 'سورس یافت نشد' }, { status: 404 });
    const t0 = Date.now();
    const adapter = getAdapter(src.type);
    const candidate = await adapter.fetchCandidate(src as any, src.newspaper as any, tehranToday());
    let dims: { width: number; height: number } | null = null;
    try {
      const img = await downloadCandidate(candidate);
      dims = { width: img.width, height: img.height };
    } catch (e: any) {
      return NextResponse.json({
        success: true,
        data: { ok: false, stage: 'download', imageUrl: candidate.imageUrl, error: String(e?.message || e), ms: Date.now() - t0 },
      });
    }
    return NextResponse.json({
      success: true,
      data: { ok: true, imageUrl: candidate.imageUrl, pageUrl: candidate.pageUrl, title: candidate.title, evidence: candidate.evidence, dims, ms: Date.now() - t0 },
    });
  } catch (e: any) {
    return NextResponse.json({ success: true, data: { ok: false, stage: 'discover', error: String(e?.message || e).slice(0, 300) } });
  }
}
