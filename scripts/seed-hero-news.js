const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newsData = [
    {
      title: 'آغاز عملیات اجرایی ساخت پل شهید خلیلی در بوشهر',
      description: 'عملیات اجرایی ساخت پل شهید خلیلی به عنوان بزرگترین پل دریایی جنوب کشور با حضور مسئولان استانی در بوشهر آغاز شد. این پل به طول ۱.۲ کیلومتر شهر بوشهر را به جزیره خارگ متصل می‌کند.',
      link: 'https://www.irna.ir/news/86232851',
      source: 'irna',
      sourceName: 'ایرنا',
      category: 'استانی',
      image: 'https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=800',
      status: 'APPROVED',
      publishedAt: new Date(),
    },
    {
      title: 'صید ۲۵۰۰ تن میگو از آب‌های ساحلی دیلم',
      description: 'رئیس شیلات شهرستان دیلم از صید بیش از ۲۵۰۰ تن میگو از آب‌های ساحلی این شهرستان خبر داد. این میزان صید نسبت به مدت مشابه سال گذشته ۳۰ درصد افزایش داشته است.',
      link: 'https://www.irna.ir/news/86231996',
      source: 'irna',
      sourceName: 'ایرنا',
      category: 'اقتصادی',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      status: 'APPROVED',
      publishedAt: new Date(Date.now() - 3600000),
    },
    {
      title: 'بهره‌برداری از فاز توسعه پتروشیمی بوشهر با سرمایه‌گذاری ۲ میلیارد دلاری',
      description: 'فاز توسعه مجتمع پتروشیمی بوشهر با سرمایه‌گذاری بیش از ۲ میلیارد دلار و اشتغال‌زایی مستقیم برای ۳۰۰۰ نفر به بهره‌برداری رسید. این پروژه ظرفیت تولید محصولات پتروشیمی استان را دو برابر می‌کند.',
      link: 'https://www.irna.ir/news/86232641',
      source: 'irna',
      sourceName: 'ایرنا',
      category: 'اقتصادی',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
      status: 'APPROVED',
      publishedAt: new Date(Date.now() - 7200000),
    },
  ];

  console.log('Creating news...');
  const created = [];
  for (const data of newsData) {
    const news = await prisma.externalNews.create({ data });
    created.push(news);
    console.log('Created:', news.title);
  }

  console.log('Assigning to homepage slots...');
  const slots = [
    { slotKey: 'hero-main', label: 'خبر اصلی', newsId: created[0].id },
    { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', newsId: created[1].id },
    { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', newsId: created[2].id },
  ];

  for (const slot of slots) {
    await prisma.homepageSlot.upsert({
      where: { slotKey: slot.slotKey },
      update: { type: 'EXTERNAL', externalNewsId: slot.newsId, isActive: true, order: 0 },
      create: { slotKey: slot.slotKey, label: slot.label, type: 'EXTERNAL', externalNewsId: slot.newsId, isActive: true, order: 0 },
    });
    console.log('Assigned:', slot.slotKey);
  }

  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
