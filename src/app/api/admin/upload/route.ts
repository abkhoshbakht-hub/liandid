import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';

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

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'حجم عکس نباید بیشتر از ۴ مگابایت باشد' },
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

    // Fallback مطمئن: فشرده‌سازی با sharp + base64 داخل دیتابیس (بدون نیاز به سرویس خارجی)
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let mimeType = file.type || 'image/jpeg';

    try {
      const sharp = (await import('sharp')).default;
      const compressed = await sharp(buffer)
        .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      if (compressed.length < buffer.length) {
        buffer = compressed;
        mimeType = 'image/jpeg';
      }
    } catch {}

    if (buffer.length > 1.5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'عکس حتی بعد از فشرده‌سازی بزرگ است؛ لطفا عکس کوچکتر انتخاب کنید' },
        { status: 400 }
      );
    }

    const base64 = buffer.toString('base64');
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
