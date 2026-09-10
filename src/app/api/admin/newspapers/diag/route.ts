import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// تشخیص عیب: چرا API عمومی روزنامه‌ها خالی برمی‌گرداند
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  }
  const out: any = {};
  try {
    out.papersNoFilter = await prisma.newspaper.count();
  } catch (e: any) { out.papersNoFilterErr = String(e?.message || e).slice(0, 200); }
  try {
    out.papersActive = await prisma.newspaper.count({ where: { active: true } });
  } catch (e: any) { out.papersActiveErr = String(e?.message || e).slice(0, 200); }
  try {
    const p = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } });
    out.papersFull = p.length;
    out.sample = p.slice(0, 3).map((x) => ({ id: x.id, name: x.name, slug: x.slug, active: x.active }));
  } catch (e: any) { out.papersFullErr = String(e?.message || e).slice(0, 300); }
  try {
    const p2 = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, name: true, slug: true } });
    out.papersSelect = p2.length;
  } catch (e: any) { out.papersSelectErr = String(e?.message || e).slice(0, 300); }
  try {
    out.issuesTotal = await prisma.newspaperIssue.count();
    out.issuesPublished = await prisma.newspaperIssue.count({ where: { status: 'PUBLISHED' } });
  } catch (e: any) { out.issuesErr = String(e?.message || e).slice(0, 200); }
  return NextResponse.json({ success: true, data: out });
}
