import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

const TYPES = ['official', 'telegram', 'news_agency', 'other', 'manual'];

export async function PUT(req: Request, { params }: { params: Promise<{ sid: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { sid } = await params;
  try {
    const b = await req.json();
    const data: any = {};
    if (b.name !== undefined) data.name = String(b.name).slice(0, 200);
    if (b.type !== undefined && TYPES.includes(b.type)) data.type = b.type;
    if (b.url !== undefined) data.url = b.url?.slice(0, 1000) || null;
    if (b.priority !== undefined) data.priority = Number(b.priority) || 0;
    if (b.active !== undefined) data.active = !!b.active;
    if (b.parserType !== undefined) data.parserType = b.parserType?.slice(0, 100) || null;
    if (b.configuration !== undefined) {
      if (b.configuration) { try { JSON.parse(b.configuration); } catch { return NextResponse.json({ success: false, message: 'تنظیمات باید JSON معتبر باشد' }, { status: 400 }); } }
      data.configuration = b.configuration || null;
    }
    const src = await prisma.newspaperSource.update({ where: { id: sid }, data });
    return NextResponse.json({ success: true, data: src });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در ویرایش سورس' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ sid: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { sid } = await params;
  await prisma.newspaperSource.delete({ where: { id: sid } });
  return NextResponse.json({ success: true });
}
