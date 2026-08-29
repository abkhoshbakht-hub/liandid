import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const adminEmail = 'admin@liandid.ir';
  const adminPassword = 'LianDid@1396';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ ادمین قبلاً ایجاد شده است!');
    console.log('📧 ایمیل:', adminEmail);
    console.log('🔑 رمز عبور:', adminPassword);
    return;
  }

  const hashedPassword = await hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: 'مدیر سایت',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'مدیر مسئول پایگاه خبری لیان دید',
    },
  });

  console.log('🎉 ادمین با موفقیت ایجاد شد!');
  console.log('─────────────────────────────');
  console.log('📧 ایمیل:', adminEmail);
  console.log('🔑 رمز عبور:', adminPassword);
  console.log('👤 نام:', admin.name);
  console.log('🏷️ نقش:', admin.role);
  console.log('─────────────────────────────');
  console.log('⚠️  رمز عبور را تغییر دهید!');
}

createAdmin()
  .catch((e) => {
    console.error('❌ خطا:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
