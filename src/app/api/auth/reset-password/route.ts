import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: 'همه فیلدها الزامی هستند' });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'رمز جدید باید حداقل ۶ کاراکتر باشد' });
    }

    const cleanPhone = phone.replace(/\s/g, '');

    const user = await prisma.user.findFirst({ where: { phone: cleanPhone, isActive: true } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'کاربری یافت نشد' });
    }

    if (!user.resetToken || user.resetToken !== otp) {
      return NextResponse.json({ success: false, message: 'کد وارد شده اشتباه است' });
    }

    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ success: false, message: 'کد منقضی شده است. دوباره درخواست دهید' });
    }

    const hashed = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return NextResponse.json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد. حالا می‌توانید وارد شوید' });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در سرور' });
  }
}
