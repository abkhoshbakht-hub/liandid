import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ success: false, message: 'نام تگ الزامی است' }, { status: 400 });
    }

    const slug = name.replace(/\s+/g, '-').toLowerCase();
    const tag = await prisma.tag.create({ data: { name, slug } });
    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
