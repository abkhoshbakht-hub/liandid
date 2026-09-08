import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const data: Record<string, string> = {};
    // لینک‌های کوتاه در پاسخ عمومی نمی‌آیند (جدا مدیریت می‌شوند)
    settings.forEach(s => { if (!s.key.startsWith('short:')) data[s.key] = s.value; });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // کلیدهای محافظت‌شده: فقط برنامه‌نویس (کد) می‌تواند تغییر دهد، نه ادمین
    const PROTECTED_KEYS = ['footerCreditText', 'footerCreditLink'];
    for (const [key, value] of Object.entries(body)) {
      if (PROTECTED_KEYS.includes(key)) continue;
      if (typeof value === 'string') {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
