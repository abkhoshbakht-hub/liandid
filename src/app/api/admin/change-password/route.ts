import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'غير مصرح' });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'همه فیلدها الزامی هستند' });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'رمز جدید باید حداقل ۶ کاراکتر باشد' });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'کاربر یافت نشد' });
    }

    const isCurrentValid = await compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, message: 'رمز فعلی اشتباه است' });
    }

    const hashed = await hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در سرور' });
  }
}
