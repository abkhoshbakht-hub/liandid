import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

const FALLBACKS = { maxMb: 1, quality: 75, maxDim: 1280, format: 'webp' };

// سقف استاندارد عکس خبری: ۲۰۰ کیلوبایت (استاندارد سایت‌های خبری برای سرعت)
const TARGET_BYTES = 200 * 1024;

async function getImageSettings() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ['image_max_mb', 'image_quality', 'image_max_dim', 'image_format'] } },
    });
    const map: Record<string, string> = {};
    rows.forEach(r => { map[r.key] = r.value; });
    const maxMb = parseFloat(map.image_max_mb || '');
    const quality = parseInt(map.image_quality || '', 10);
    const maxDim = parseInt(map.image_max_dim || '', 10);
    const format = (map.image_format || '').toLowerCase();
    return {
      maxMb: Number.isFinite(maxMb) && maxMb >= 1 && maxMb <= 10 ? maxMb : FALLBACKS.maxMb,
      quality: Number.isFinite(quality) && quality >= 10 && quality <= 100 ? quality : FALLBACKS.quality,
      maxDim: Number.isFinite(maxDim) && maxDim >= 400 && maxDim <= 2560 ? maxDim : FALLBACKS.maxDim,
      format: ['jpeg', 'webp', 'png', 'original'].includes(format) ? format : FALLBACKS.format,
    };
  } catch {
    return FALLBACKS;
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

    const settings = await getImageSettings();

    if (file.size > settings.maxMb * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: `حجم عکس نباید بیشتر از ${settings.maxMb} مگابایت باشد` },
        { status: 400 }
      );
    }

    // اگر توکن Blob هست (ورسل) → ذخیره دائمی در Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `uploads/${randomUUID()}.${ext}`;
        const blob = await put(fileName, file, { access: 'public' });
        return NextResponse.json({
          success: true,
          message: 'فایل با موفقیت آپلود شد',
          data: { url: blob.url, name: file.name },
        });
      } catch (e) {
        console.error('Blob upload failed, fallback to base64:', e);
      }
    }

    // Fallback مطمئن: تغییر اندازه + تبدیل فرمت با sharp + base64 داخل دیتابیس
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let mimeType = file.type || 'image/jpeg';
    let out = buffer;

    try {
      const sharp = (await import('sharp')).default;
      const resized = sharp(buffer).resize({ width: settings.maxDim, height: settings.maxDim, fit: 'inside', withoutEnlargement: true });
      const canAdapt = settings.format === 'webp' || settings.format === 'jpeg';
      if (settings.format === 'png') {
        out = await resized.png().toBuffer();
        mimeType = 'image/png';
      } else if (settings.format === 'original') {
        out = await resized.toBuffer();
        mimeType = file.type || 'image/jpeg';
      } else {
        // فشرده‌سازی تطبیقی: کیفیت را کم می‌کند تا حجم زیر ۲۰۰ کیلوبایت برود (حداقل کیفیت ۵۰)
        let q = settings.quality;
        const isWebp = settings.format === 'webp';
        mimeType = isWebp ? 'image/webp' : 'image/jpeg';
        for (;;) {
          const trial = await (isWebp ? resized.clone().webp({ quality: q }) : resized.clone().jpeg({ quality: q })).toBuffer();
          out = trial;
          if (trial.length <= TARGET_BYTES || q <= 50) break;
          q -= 10;
        }
      }
    } catch {}

    if (out.length > 1.5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'عکس حتی بعد از فشرده‌سازی بزرگ است؛ لطفا عکس کوچکتر انتخاب کنید' },
        { status: 400 }
      );
    }

    const base64 = out.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      message: 'فایل با موفقیت آپلود شد',
      data: { url: dataUrl, name: file.name },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
