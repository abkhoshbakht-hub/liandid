import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, userName, userEmail, content } = body;

    if (!articleId || !userName || !content) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات ناقص است' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: userEmail || `guest-${Date.now()}@liandid.ir` },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          email: userEmail || `guest-${Date.now()}@liandid.ir`,
          password: 'guest-password-not-login',
        },
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: user.id,
        articleId,
        approved: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'نظر شما ثبت شد و پس از تایید مدیر نمایش داده خواهد شد.',
      data: comment,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { success: false, message: 'شناسه مقاله الزامی است' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        approved: true,
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
