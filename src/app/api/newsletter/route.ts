import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'ایمیل الزامی است' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'ایمیل معتبر نیست' }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ message: 'شما قبلاً عضو شده‌اید' }, { status: 200 });
      }
      await prisma.subscriber.update({ where: { email }, data: { isActive: true } });
      return NextResponse.json({ message: 'عضویت شما فعال شد' }, { status: 200 });
    }

    await prisma.subscriber.create({ data: { email } });

    // ارسال ایمیل خوش‌آمدگویی
    try {
      const { sendWelcomeEmail } = await import('@/lib/email');
      await sendWelcomeEmail(email);
    } catch {}

    return NextResponse.json({ message: 'عضویت با موفقیت انجام شد' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.subscriber.count({ where: { isActive: true } });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
