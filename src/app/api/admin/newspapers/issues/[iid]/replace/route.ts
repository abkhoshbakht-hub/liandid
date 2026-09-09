import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseImageDims, hashBuffer } from '@/lib/newspapers/image';
import { getCoverStorage } from '@/lib/newspapers/storage';

export const dynamic = 'force-dynamic';

// جایگزینی دستی تصویر یک شماره (Source: MANUAL)
export async function POST(req: Request, { params }: { params: Promise<{ iid: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const { iid } = await params;
    const issue = await prisma.newspaperIssue.findUnique({ where: { id: iid }, include: { newspaper: true } });
    if (!issue) return NextResponse.json({ success: false, message: 'شماره یافت نشد' }, { status: 404 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ success: false, message: 'عکس لازم است' }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 12 * 1024 * 1024) return NextResponse.json({ success: false, message: 'حجم عکس بیش از ۱۲ مگابایت است' }, { status: 400 });
    const dims = parseImageDims(buf);
    if (!dims) return NextResponse.json({ success: false, message: 'فایل تصویر معتبر نیست' }, { status: 400 });
    const hash = hashBuffer(buf);

    const storage = getCoverStorage();
    const datePath = issue.date.toISOString().slice(0, 10);
    const coverUrl = await storage.save(buf, { paperSlug: issue.newspaper.slug, date: datePath, kind: 'original', mime: dims.mime });
    const webUrl = coverUrl;
    const thumbUrl = coverUrl;

    const updated = await prisma.newspaperIssue.update({
      where: { id: iid },
      data: { imageUrl: webUrl, thumbnailUrl: thumbUrl, imageHash: hash, originalUrl: 'manual', confidence: 100 },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در جایگزینی' }, { status: 500 });
  }
}
