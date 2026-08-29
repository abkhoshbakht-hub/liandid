import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        article: { select: { title: true, slug: true } },
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

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { commentId, approved } = body;

    if (!commentId) {
      return NextResponse.json(
        { success: false, message: 'شناسه نظر الزامی است' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { approved },
    });

    return NextResponse.json({
      success: true,
      message: 'نظر با موفقیت بروزرسانی شد',
      data: comment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
