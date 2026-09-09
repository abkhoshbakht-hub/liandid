import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

// PATCH { action: publish | reject | review, issueNumber?, title? }
export async function PATCH(req: Request, { params }: { params: Promise<{ iid: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { iid } = await params;
  try {
    const b = await req.json();
    const data: any = {};
    if (b.action === 'publish') { data.status = 'PUBLISHED'; data.publishedAt = new Date(); }
    else if (b.action === 'reject') { data.status = 'REJECTED'; }
    else if (b.action === 'review') { data.status = 'NEEDS_REVIEW'; data.publishedAt = null; }
    else return NextResponse.json({ success: false, message: 'action نامعتبر' }, { status: 400 });
    if (b.issueNumber !== undefined) data.issueNumber = String(b.issueNumber).slice(0, 50) || null;
    if (b.title !== undefined) data.title = String(b.title).slice(0, 300) || null;
    const issue = await prisma.newspaperIssue.update({ where: { id: iid }, data });
    return NextResponse.json({ success: true, data: issue });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ iid: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { iid } = await params;
  await prisma.newspaperIssue.delete({ where: { id: iid } });
  return NextResponse.json({ success: true });
}
