import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
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

    const ext = file.name.split('.').pop();
    const fileName = `uploads/${randomUUID()}.${ext}`;

    // روی ورسل از Blob استفاده می‌شود، روی لوکال fallback به فایل‌سیستم
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(fileName, file, { access: 'public' });
      return NextResponse.json({
        success: true,
        message: 'فایل با موفقیت آپلود شد',
        data: { url: blob.url, name: file.name },
      });
    }

    // Fallback برای محیط لوکال (توکن Blob وجود ندارد)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName.split('/').pop()!), buffer);

    return NextResponse.json({
      success: true,
      message: 'فایل با موفقیت آپلود شد',
      data: { url: `/uploads/${fileName.split('/').pop()}`, name: file.name },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
