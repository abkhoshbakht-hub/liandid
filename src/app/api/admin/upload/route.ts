import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { validateUploadFile, buildBlobPath } from '@/lib/upload-security';

const FALLBACKS = { maxMb: 1, quality: 75, maxDim: 1280, format: 'webp' };

async function getImageSettings() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ['image_max_mb', 'image_quality', 'image_max_dim', 'image_format'] } },
    });
    const map: Record<string, string> = {};
    rows.forEach(r => { map[r.key] = r.value; });
    const maxMb = parseFloat(map.image_max_mb || '');
    return {
      maxMb: Number.isFinite(maxMb) && maxMb >= 1 && maxMb <= 10 ? maxMb : FALLBACKS.maxMb,
    };
  } catch {
    return { maxMb: FALLBACKS.maxMb };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'فایل انتخاب نشده است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی نوع و حجم (MIME واقعی، نه extension کاربر)
    const settings = await getImageSettings();
    let validated;
    try {
      validated = validateUploadFile(file.type, file.size, settings.maxMb);
    } catch (e: unknown) {
      return NextResponse.json(
        { success: false, message: e instanceof Error ? e.message : 'فایل مجاز نیست' },
        { status: 400 }
      );
    }

    // بدون Storage پیکربندی‌شده، آپلود جدید انجام نمی‌شود (جلوگیری از Base64 جدید در Production)
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'سرویس ذخیره‌سازی فایل پیکربندی نشده است؛ لطفاً توکن Vercel Blob را در تنظیمات سرور قرار دهید' },
        { status: 503 }
      );
    }

    try {
      const { put } = await import('@vercel/blob');
      const fileName = buildBlobPath(randomUUID(), validated.ext);
      const blob = await put(fileName, file, { access: 'public', contentType: validated.mime });
      return NextResponse.json({
        success: true,
        message: 'فایل با موفقیت آپلود شد',
        data: { url: blob.url, name: file.name, kind: validated.kind },
      });
    } catch (e) {
      console.error('Blob upload failed:', e);
      return NextResponse.json(
        { success: false, message: 'خطا در ذخیره‌سازی فایل' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
