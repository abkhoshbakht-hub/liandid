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
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop();
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      mediaUrl = `/uploads/${fileName}`;

      const { writeFile } = require('fs/promises');
      const { join } = require('path');
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await require('fs').promises.mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, fileName), buffer);
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