import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const mediaType = formData.get('mediaType') as string;
    const senderName = formData.get('senderName') as string;
    const senderPhone = formData.get('senderPhone') as string;
    const senderEmail = formData.get('senderEmail') as string;
    const file = formData.get('file') as File | null;

    if (!title || !content || !category || !senderName) {
      return NextResponse.json(
        { error: 'فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    let mediaUrl = null;
    let fileName = null;

    if (file && file.size > 0) {
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: 'حجم فایل نباید بیشتر از ۴ مگابایت باشد' }, { status: 400 });
      }
      const ext = file.name.split('.').pop() || 'jpg';
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const { put } = await import('@vercel/blob');
          const blob = await put(`uploads/${fileName}`, file, { access: 'public' });
          mediaUrl = blob.url;
        } catch (e) {
          console.error('Blob submit upload failed, fallback to base64:', e);
        }
      }
      if (!mediaUrl) {
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
          return NextResponse.json({ error: 'عکس حتی بعد از فشرده‌سازی بزرگ است' }, { status: 400 });
        }
        const base64 = buffer.toString('base64');
        mediaUrl = `data:${mimeType};base64,${base64}`;
      }
    }

    const submission = await prisma.userSubmission.create({
      data: {
        title,
        content,
        category,
        mediaType: mediaType || 'TEXT',
        mediaUrl,
        fileName,
        senderName,
        senderPhone: senderPhone || null,
        senderEmail: senderEmail || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'خبر شما با موفقیت ارسال شد و پس از بررسی منتشر خواهد شد',
      id: submission.id,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال خبر' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const submissions = await prisma.userSubmission.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: submissions });
  } catch (error) {
    return NextResponse.json({ items: [] });
  }
}
