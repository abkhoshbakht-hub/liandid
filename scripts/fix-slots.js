const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Get news WITH images, sorted by date
  const withImages = await p.externalNews.findMany({
    where: { 
      status: 'APPROVED',
      image: { not: null },
      NOT: { image: '' }
    },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, image: true, sourceName: true }
  });
  
  console.log(`News with images: ${withImages.length}`);
  withImages.slice(0, 5).forEach(n => console.log(`  ${n.sourceName}: ${n.title.substring(0,40)} img:${n.image.substring(0,80)}`));

  // Assign ONLY news with images to slots
  const slotDefs = [
    { slotKey: 'hero-main', label: 'خبر اصلی', order: 0 },
    { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', order: 1 },
    { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', order: 2 },
    { slotKey: 'breaking-1', label: 'خبر فوری ۱', order: 3 },
    { slotKey: 'breaking-2', label: 'خبر فوری ۲', order: 4 },
    { slotKey: 'breaking-3', label: 'خبر فوری ۳', order: 5 },
    { slotKey: 'breaking-4', label: 'خبر فوری ۴', order: 6 },
    { slotKey: 'breaking-5', label: 'خبر فوری ۵', order: 7 },
    { slotKey: 'latest-1', label: 'آخرین ۱', order: 8 },
    { slotKey: 'latest-2', label: 'آخرین ۲', order: 9 },
    { slotKey: 'latest-3', label: 'آخرین ۳', order: 10 },
    { slotKey: 'latest-4', label: 'آخرین ۴', order: 11 },
    { slotKey: 'latest-5', label: 'آخرین ۵', order: 12 },
    { slotKey: 'latest-6', label: 'آخرین ۶', order: 13 },
    { slotKey: 'latest-7', label: 'آخرین ۷', order: 14 },
    { slotKey: 'latest-8', label: 'آخرین ۸', order: 15 },
    { slotKey: 'latest-9', label: 'آخرین ۹', order: 16 },
    { slotKey: 'latest-10', label: 'آخرین ۱۰', order: 17 },
    { slotKey: 'analysis-1', label: 'تحلیل ۱', order: 18 },
    { slotKey: 'analysis-2', label: 'تحلیل ۲', order: 19 },
    { slotKey: 'analysis-3', label: 'تحلیل ۳', order: 20 },
  ];

  // Cycle through news with images
  for (let i = 0; i < slotDefs.length; i++) {
    const slot = slotDefs[i];
    const news = withImages[i % withImages.length];
    await p.homepageSlot.upsert({
      where: { slotKey: slot.slotKey },
      update: { type: 'EXTERNAL', externalNewsId: news.id, isActive: true, order: slot.order },
      create: { slotKey: slot.slotKey, label: slot.label, type: 'EXTERNAL', externalNewsId: news.id, isActive: true, order: slot.order },
    });
  }
  console.log(`\nAssigned ${slotDefs.length} slots to news with images`);
  
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
