const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function cuid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'clx';
  id += chars[Math.floor(Math.random() * 10)];
  id += chars[Math.floor(Math.random() * 36)];
  for (let i = 0; i < 22; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const slotDefs = [
  { slotKey: 'hero-main', label: 'خبر اصلی', order: 0 },
  { slotKey: 'hero-side-1', label: 'خبر فرعی ۱', order: 1 },
  { slotKey: 'hero-side-2', label: 'خبر فرعی ۲', order: 2 },
  { slotKey: 'breaking-1', label: 'فوری ۱', order: 3 },
  { slotKey: 'breaking-2', label: 'فوری ۲', order: 4 },
  { slotKey: 'breaking-3', label: 'فوری ۳', order: 5 },
  { slotKey: 'breaking-4', label: 'فوری ۴', order: 6 },
  { slotKey: 'breaking-5', label: 'فوری ۵', order: 7 },
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

async function main() {
  // Delete old slots
  await p.homepageSlot.deleteMany();
  
  // Get Bushehr news with images first, then without
  const bushehrWithImg = await p.externalNews.findMany({
    where: { 
      status: 'APPROVED',
      image: { not: null },
      NOT: { image: '' },
      OR: [
        { sourceName: 'بوشهر خبر' },
        { sourceName: 'بوشهر نیوز' },
        { sourceName: 'پی جی نیوز' },
      ]
    },
    orderBy: { publishedAt: 'desc' },
  });
  
  const bushehrAll = await p.externalNews.findMany({
    where: { 
      status: 'APPROVED',
      OR: [
        { sourceName: 'بوشهر خبر' },
        { sourceName: 'بوشهر نیوز' },
        { sourceName: 'پی جی نیوز' },
      ]
    },
    orderBy: { publishedAt: 'desc' },
  });
  
  console.log(`Bushehr news with images: ${bushehrWithImg.length}`);
  console.log(`Bushehr news total: ${bushehrAll.length}`);

  // Use bushehr with images first, then all bushehr, then fill with national
  const bushehrPool = [...bushehrWithImg, ...bushehrAll.filter(n => !bushehrWithImg.find(b => b.id === n.id))];
  
  // Also get national news with images for fallback
  const nationalWithImg = await p.externalNews.findMany({
    where: { 
      status: 'APPROVED',
      image: { not: null },
      NOT: { image: '' },
      NOT: [
        { sourceName: 'بوشهر خبر' },
        { sourceName: 'بوشهر نیوز' },
        { sourceName: 'پی جی نیوز' },
      ]
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });
  
  const allPool = [...bushehrPool, ...nationalWithImg];
  console.log(`Total pool: ${allPool.length}`);

  let bushehrUsed = 0;
  let nationalUsed = 0;

  for (let i = 0; i < slotDefs.length; i++) {
    const s = slotDefs[i];
    const n = allPool[i % allPool.length];
    
    if (!n) continue;
    
    const isBushehr = n.sourceName === 'بوشهر خبر' || n.sourceName === 'بوشهر نیوز' || n.sourceName === 'پی جی نیوز';
    if (isBushehr) bushehrUsed++;
    else nationalUsed++;
    
    await p.homepageSlot.create({
      data: { 
        slotKey: s.slotKey, 
        label: s.label, 
        type: 'EXTERNAL', 
        externalNewsId: n.id, 
        isActive: true, 
        order: s.order 
      },
    });
  }
  
  console.log(`\nAssigned ${slotDefs.length} slots`);
  console.log(`Bushehr: ${bushehrUsed}, National: ${nationalUsed}`);
  
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
