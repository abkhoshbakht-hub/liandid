import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, slug, icon, color, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'نام و لینک الزامی است' },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی با این نام یا لینک وجود دارد' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        color: color || null,
        order: order || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت ایجاد شد',
      data: category,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
