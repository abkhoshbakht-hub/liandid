const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Approve all RSS news
  const approved = await p.externalNews.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'APPROVED' }
  });
  console.log(`Approved ${approved.count} news`);

  // 2. Get all approved news
  const news = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true }
  });
  console.log(`Total approved: ${news.length}`);

  // 3. Assign to homepage slots
  const slotDefs = [
    { slotKey: 'hero-main', label: 'خبر اصلی', order: 0 },
    { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', order: 1 },
    { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', order: 2 },
    { slotKey: 'breaking-1', label: 'خبر فوری ۱', order: 3 },
    { slotKey: 'breaking-2', label: 'خبر فوری ۲', order: 4 },
    { slotKey: 'breaking-3', label: 'خبر فوری ۳', order: 5 },
    { slotKey: 'breaking-4', label: 'خبر فوری ۴', order: 6 },
    { slotKey: 'breaking-5', label: 'خبر فوری ۵', order: 7 },
    { slotKey: 'latest-1', label: 'آخرین اخبار ۱', order: 8 },
    { slotKey: 'latest-2', label: 'آخرین اخبار ۲', order: 9 },
    { slotKey: 'latest-3', label: 'آخرین اخبار ۳', order: 10 },
    { slotKey: 'latest-4', label: 'آخرین اخبار ۴', order: 11 },
    { slotKey: 'latest-5', label: 'آخرین اخبار ۵', order: 12 },
    { slotKey: 'latest-6', label: 'آخرین اخبار ۶', order: 13 },
    { slotKey: 'latest-7', label: 'آخرین اخبار ۷', order: 14 },
    { slotKey: 'latest-8', label: 'آخرین اخبار ۸', order: 15 },
    { slotKey: 'latest-9', label: 'آخرین اخبار ۹', order: 16 },
    { slotKey: 'latest-10', label: 'آخرین اخبار ۱۰', order: 17 },
    { slotKey: 'analysis-1', label: 'تحلیل ۱', order: 18 },
    { slotKey: 'analysis-2', label: 'تحلیل ۲', order: 19 },
    { slotKey: 'analysis-3', label: 'تحلیل ۳', order: 20 },
  ];

  let idx = 0;
  for (const slot of slotDefs) {
    const n = news[idx % news.length];
    await p.homepageSlot.upsert({
      where: { slotKey: slot.slotKey },
      update: { type: 'EXTERNAL', externalNewsId: n.id, isActive: true, order: slot.order },
      create: { slotKey: slot.slotKey, label: slot.label, type: 'EXTERNAL', externalNewsId: n.id, isActive: true, order: slot.order },
    });
    idx++;
  }
  console.log(`Assigned ${slotDefs.length} slots`);
  
  // 4. Summary
  const withImg = await p.externalNews.count({ where: { AND: [{ image: { not: null } }, { image: { not: '' } }] } });
  console.log(`\nDone! ${news.length} news ready, ${withImg} with images`);
  
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
