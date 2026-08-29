import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return null;
  return session;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const where = status ? { status } : {};
    const submissions = await prisma.userSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ items: submissions, total: submissions.length });
  } catch {
    return NextResponse.json({ items: [], total: 0 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 403 });
    }
    const { id, status, adminNote } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const submission = await prisma.userSubmission.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    });
    return NextResponse.json({ success: true, item: submission });
  } catch {
    return NextResponse.json({ error: 'خطا در بروزرسانی' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 403 });
    }
    const { id } = await request.json();
    await prisma.userSubmission.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}
