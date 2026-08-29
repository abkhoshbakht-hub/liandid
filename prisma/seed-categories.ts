import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'سیاسی', slug: 'siyasi', icon: '🏛️', color: '#1B365D', order: 1 },
  { name: 'اقتصادی', slug: 'eghtesadi', icon: '💰', color: '#C9A96E', order: 2 },
  { name: 'اجتماعی', slug: 'ejtemaei', icon: '👥', color: '#2563EB', order: 3 },
  { name: 'بین‌الملل', slug: 'beynolmelal', icon: '🌍', color: '#059669', order: 4 },
  { name: 'فناوری', slug: 'fanavari', icon: '💻', color: '#7C3AED', order: 5 },
  { name: 'ورزشی', slug: 'varzeshi', icon: '⚽', color: '#DC2626', order: 6 },
  { name: 'فرهنگی', slug: 'farhangi', icon: '🎭', color: '#D97706', order: 7 },
  { name: 'علمی', slug: 'elmi', icon: '🔬', color: '#0891B2', order: 8 },
  { name: 'گالری', slug: 'gallery', icon: '🖼️', color: '#BE185D', order: 9 },
  { name: 'استانها', slug: 'ostanha', icon: '📍', color: '#4338CA', order: 10 },
];

async function main() {
  console.log('🌱 شروع ایجاد دسته‌بندی‌ها...');

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`✅ ${cat.name} ایجاد شد`);
    } else {
      console.log(`⏭️ ${cat.name} از قبل وجود دارد`);
    }
  }

  console.log('🎉 تمام دسته‌بندی‌ها ایجاد شدند');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
