import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PREFIX = 'frontpage:';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// جلدهای قدیمی‌تر از ۷ روز پاک می‌شوند تا دیتابیس سنگین نشود
const KEEP_DAYS = 7;

async function cleanupOld() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
    const stamp = cutoff.toISOString().slice(0, 10);
    await prisma.siteSetting.deleteMany({
      where: { key: { startsWith: PREFIX }, AND: { key: { lt: `${PREFIX}${stamp}` } } },
    });
  } catch {}
}

// لیست جلدهای یک تاریخ
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || '';
    if (!DATE_RE.test(date)) {
      return NextResponse.json({ success: false, message: 'تاریخ معتبر نیست' }, { status: 400 });
    }
    const rows = await prisma.siteSetting.findMany({
      where: { key: { startsWith: `${PREFIX}${date}:` } },
      orderBy: { key: 'asc' },
    });
    const items = rows.map(r => {
      try {
        const data = JSON.parse(r.value);
        return { paper: data?.paper || '', image: data?.image || '' };
      } catch {
        return { paper: '', image: '' };
      }
    }).filter(i => i.paper && i.image);
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}

// ثبت جلد روزنامه
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const body = await req.json();
    const date = typeof body?.date === 'string' ? body.date : '';
    const paper = typeof body?.paper === 'string' ? body.paper.trim() : '';
    const image = typeof body?.image === 'string' ? body.image : '';

    if (!DATE_RE.test(date)) {
      return NextResponse.json({ success: false, message: 'تاریخ معتبر نیست' }, { status: 400 });
    }
    if (!paper || paper.length > 60) {
      return NextResponse.json({ success: false, message: 'نام روزنامه معتبر نیست' }, { status: 400 });
    }
    if (!image || image.length > 3 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'عکس معتبر نیست یا خیلی بزرگ است' }, { status: 400 });
    }

    await prisma.siteSetting.upsert({
      where: { key: `${PREFIX}${date}:${paper}` },
      update: { value: JSON.stringify({ paper, image }) },
      create: { key: `${PREFIX}${date}:${paper}`, value: JSON.stringify({ paper, image }) },
    });
    await cleanupOld();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}

// حذف جلد
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const body = await req.json();
    const date = typeof body?.date === 'string' ? body.date : '';
    const paper = typeof body?.paper === 'string' ? body.paper.trim() : '';
    if (!DATE_RE.test(date) || !paper) {
      return NextResponse.json({ success: false, message: 'اطلاعات معتبر نیست' }, { status: 400 });
    }
    await prisma.siteSetting.delete({ where: { key: `${PREFIX}${date}:${paper}` } }).catch(() => null);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
