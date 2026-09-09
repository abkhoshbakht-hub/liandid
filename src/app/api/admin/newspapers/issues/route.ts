import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';
import { processCover } from '@/lib/newspapers/image';
import { getCoverStorage } from '@/lib/newspapers/storage';
import crypto from 'crypto';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

// فهرست شماره‌ها با فیلتر
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  try {
    const q = new URL(req.url).searchParams;
    const where: any = {};
    if (q.get('status')) where.status = q.get('status');
    if (q.get('newspaperId')) where.newspaperId = q.get('newspaperId');
    if (q.get('date')) {
      const d = new Date(`${q.get('date')}T00:00:00.000Z`);
      if (!isNaN(d.getTime())) where.date = d;
    }
    const page = Math.max(1, Number(q.get('page')) || 1);
    const per = 20;
    const [total, items] = await Promise.all([
      prisma.newspaperIssue.count({ where }),
      prisma.newspaperIssue.findMany({
        where,
        include: { newspaper: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * per,
        take: per,
      }),
    ]);
    return NextResponse.json({ success: true, data: { items, total, page, pages: Math.ceil(total / per) } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}

async function bufferToCover(file: File) {
  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.length > 12 * 1024 * 1024) throw new Error('حجم عکس بیش از ۱۲ مگابایت است');
  const meta = await sharp(buf).metadata();
  if (!meta.width) throw new Error('فایل تصویر معتبر نیست');
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  return { buf, meta, hash };
}

// آپلود دستی جلد (MANUAL) — newspaperId + file + date? (پیش‌فرض امروز)
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  try {
    const form = await req.formData();
    const newspaperId = String(form.get('newspaperId') || '');
    const file = form.get('file') as File | null;
    if (!newspaperId || !file) return NextResponse.json({ success: false, message: 'روزنامه و عکس لازم است' }, { status: 400 });
    const paper = await prisma.newspaper.findUnique({ where: { id: newspaperId } });
    if (!paper) return NextResponse.json({ success: false, message: 'روزنامه یافت نشد' }, { status: 404 });

    const day = tehranToday();
    let date = day.utcMidnight;
    let persian = day.persian;
    const dateStr = String(form.get('date') || '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      date = new Date(`${dateStr}T00:00:00.000Z`);
      persian = String(form.get('persianDate') || day.persian);
    }

    const { buf, hash } = await bufferToCover(file);
    const dup = await prisma.newspaperIssue.findFirst({ where: { newspaperId, imageHash: hash } });
    if (dup) return NextResponse.json({ success: false, message: 'این تصویر قبلاً ثبت شده است' }, { status: 400 });

    const { web, thumb } = await processCover(buf);
    const storage = getCoverStorage();
    const datePath = date.toISOString().slice(0, 10);
    const [webUrl, thumbUrl] = await Promise.all([
      storage.save(web, { paperSlug: paper.slug, date: datePath, kind: 'web', mime: 'image/webp' }),
      storage.save(thumb, { paperSlug: paper.slug, date: datePath, kind: 'thumb', mime: 'image/webp' }),
    ]);

    const issue = await prisma.newspaperIssue.upsert({
      where: { newspaperId_date: { newspaperId, date } },
      create: {
        newspaperId, date, persianDate: persian,
        title: String(form.get('title') || '').slice(0, 300) || null,
        issueNumber: String(form.get('issueNumber') || '').slice(0, 50) || null,
        originalUrl: 'manual', imageUrl: webUrl, thumbnailUrl: thumbUrl,
        imageHash: hash, confidence: 100, status: 'PUBLISHED', publishedAt: new Date(),
      },
      update: {
        persianDate: persian, imageUrl: webUrl, thumbnailUrl: thumbUrl, imageHash: hash,
        title: String(form.get('title') || '').slice(0, 300) || null,
        issueNumber: String(form.get('issueNumber') || '').slice(0, 50) || null,
        originalUrl: 'manual', confidence: 100, status: 'PUBLISHED', publishedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, data: issue });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: String(e?.message || 'خطا در آپلود') }, { status: 500 });
  }
}
