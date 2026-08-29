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
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, slug, icon, color, order } = body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    if (name || slug) {
      const existing = await prisma.category.findFirst({
        where: {
          OR: [
            name ? { name } : {},
            slug ? { slug } : {},
          ],
          id: { not: id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'دسته‌بندی با این نام یا لینک وجود دارد' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی به‌روزرسانی شد',
      data: updated,
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
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    if (category._count.articles > 0) {
      return NextResponse.json(
        { success: false, message: 'این دسته‌بندی دارای خبر است و قابل حذف نیست' },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی حذف شد',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
