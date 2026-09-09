import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

const TYPES = ['official', 'telegram', 'news_agency', 'other', 'manual'];

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { id } = await params;
  const sources = await prisma.newspaperSource.findMany({ where: { newspaperId: id }, orderBy: { priority: 'asc' } });
  return NextResponse.json({ success: true, data: sources });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  const { id } = await params;
  try {
    const b = await req.json();
    if (!b.name || !b.type) return NextResponse.json({ success: false, message: 'نام و نوع سورس لازم است' }, { status: 400 });
    if (!TYPES.includes(b.type)) return NextResponse.json({ success: false, message: 'نوع سورس نامعتبر' }, { status: 400 });
    if (b.configuration) {
      try { JSON.parse(b.configuration); } catch { return NextResponse.json({ success: false, message: 'تنظیمات باید JSON معتبر باشد' }, { status: 400 }); }
    }
    const maxP = await prisma.newspaperSource.aggregate({ where: { newspaperId: id }, _max: { priority: true } });
    const src = await prisma.newspaperSource.create({
      data: {
        newspaperId: id,
        name: String(b.name).slice(0, 200),
        type: b.type,
        url: b.url?.slice(0, 1000) || null,
        priority: b.priority !== undefined ? Number(b.priority) : (maxP._max.priority ?? -1) + 1,
        active: b.active !== false,
        parserType: b.parserType?.slice(0, 100) || null,
        configuration: b.configuration || null,
      },
    });
    return NextResponse.json({ success: true, data: src });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در ثبت سورس' }, { status: 500 });
  }
}
