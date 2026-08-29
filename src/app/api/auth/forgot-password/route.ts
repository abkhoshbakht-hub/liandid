import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: 'شماره موبایل الزامی است' });
    }

    const cleanPhone = phone.replace(/\s/g, '');

    const user = await prisma.user.findFirst({ where: { phone: cleanPhone, isActive: true } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'کاربری با این شماره موبایل یافت نشد' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    return NextResponse.json({
      success: true,
      message: 'کد بازیابی ارسال شد',
      otp: otp,
      _debug: 'کد OTP شما: ' + otp,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در سرور' });
  }
}
