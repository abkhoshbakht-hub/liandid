import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'وضعیت نامعتبر' },
        { status: 400 }
      );
    }

    const news = await prisma.externalNews.update({
      where: { id },
      data: { status },
    });

    // ارسال خودکار خبرنامه هنگام تأیید خبر خارجی
    if (status === 'APPROVED') {
      try {
        const { sendNewsletterToAll } = await import('@/lib/email');
        const title = news.title;
        await sendNewsletterToAll(
          title,
          `<h2 style="color: #1B365D;">${title}</h2>
           <p style="color: #666;">${news.sourceName}</p>
           ${news.description ? `<p>${news.description}</p>` : ''}
           <a href="${news.link}" style="display:inline-block;background:#C9A96E;color:#1B365D;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:bold;margin-top:10px;">مشاهده خبر</a>`
        );
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'خبر بروزرسانی شد',
      data: news,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.externalNews.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'خبر حذف شد',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
