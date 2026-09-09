import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { id } = await params;
  const paper = await prisma.newspaper.findUnique({
    where: { id },
    include: { sources: { orderBy: { priority: 'asc' } }, issues: { orderBy: { date: 'desc' }, take: 10 } },
  });
  if (!paper) return NextResponse.json({ success: false, message: 'یافت نشد' }, { status: 404 });
  return NextResponse.json({ success: true, data: paper });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { id } = await params;
  try {
    const b = await req.json();
    const data: any = {};
    if (b.name !== undefined) data.name = String(b.name).slice(0, 100);
    if (b.category !== undefined && ['national', 'bushehr', 'sports'].includes(b.category)) data.category = b.category;
    if (b.website !== undefined) data.website = b.website?.slice(0, 500) || null;
    if (b.telegram !== undefined) data.telegram = b.telegram?.slice(0, 200) || null;
    if (b.description !== undefined) data.description = b.description?.slice(0, 1000) || null;
    if (b.displayOrder !== undefined) data.displayOrder = Number(b.displayOrder) || 0;
    if (b.active !== undefined) data.active = !!b.active;
    const paper = await prisma.newspaper.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: paper });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در ویرایش' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { id } = await params;
  await prisma.newspaper.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
