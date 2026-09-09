import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === 'ADMIN';
}

const CATS: Record<string, string> = { national: 'سراسری', bushehr: 'بوشهر', sports: 'ورزشی' };

// فهرست روزنامه‌ها + آمار هر کدام
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  try {
    const papers = await prisma.newspaper.findMany({ orderBy: { displayOrder: 'asc' } });
    const data = await Promise.all(
      papers.map(async (p) => {
        const [issues, sources, last] = await Promise.all([
          prisma.newspaperIssue.count({ where: { newspaperId: p.id } }),
          prisma.newspaperSource.count({ where: { newspaperId: p.id, active: true } }),
          prisma.newspaperIssue.findFirst({ where: { newspaperId: p.id }, orderBy: { date: 'desc' }, select: { persianDate: true, status: true } }),
        ]);
        return { ...p, catFa: CATS[p.category] || p.category, issues, sources, lastIssue: last };
      })
    );
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: { initialized: false } });
  }
}

// افزودن روزنامه جدید (بدون نیاز به تغییر کد)
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
  try {
    const b = await req.json();
    if (!b.name || !b.slug) return NextResponse.json({ success: false, message: 'نام و نامک لازم است' }, { status: 400 });
    const slug = String(b.slug).trim().toLowerCase().replace(/\s+/g, '-');
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ success: false, message: 'نامک فقط حروف انگلیسی، عدد و خط‌تیره' }, { status: 400 });
    if (!['national', 'bushehr', 'sports'].includes(b.category)) return NextResponse.json({ success: false, message: 'دسته نامعتبر' }, { status: 400 });
    const maxOrder = await prisma.newspaper.aggregate({ _max: { displayOrder: true } });
    const paper = await prisma.newspaper.create({
      data: {
        name: String(b.name).slice(0, 100),
        slug,
        category: b.category,
        website: b.website?.slice(0, 500) || null,
        telegram: b.telegram?.slice(0, 200) || null,
        description: b.description?.slice(0, 1000) || null,
        displayOrder: Number(b.displayOrder) || (maxOrder._max.displayOrder || 0) + 1,
        active: b.active !== false,
      },
    });
    return NextResponse.json({ success: true, data: paper });
  } catch (e: any) {
    if (String(e?.message || '').includes('Unique')) return NextResponse.json({ success: false, message: 'این نامک تکراری است' }, { status: 400 });
    return NextResponse.json({ success: false, message: 'خطا در ثبت' }, { status: 500 });
  }
}
