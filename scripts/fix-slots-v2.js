const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

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
  await p.homepageSlot.deleteMany();

  // Get ALL Bushehr news, sorted by date (newest first)
  const bushehrAll = await p.externalNews.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { sourceName: 'بوشهر خبر' },
        { sourceName: 'بوشهر نیوز' },
        { sourceName: 'پی جی نیوز' },
      ],
    },
    orderBy: { publishedAt: 'desc' },
  });

  // Split: with image vs without
  const withImg = bushehrAll.filter(n => n.image && n.image.length > 10);
  const withoutImg = bushehrAll.filter(n => !n.image || n.image.length <= 10);

  // Filter old news (year 1404 = 2025-03-20 to 2026-03-19)
  // Only keep news from 2026-01-01 onwards (approx. 1404/10/11)
  const recentDate = new Date('2025-12-01');
  const recentWithImg = withImg.filter(n => n.publishedAt && n.publishedAt >= recentDate);
  const recentWithoutImg = withoutImg.filter(n => n.publishedAt && n.publishedAt >= recentDate);

  console.log(`Bushehr with image: ${withImg.length} (recent: ${recentWithImg.length})`);
  console.log(`Bushehr without image: ${withoutImg.length} (recent: ${recentWithoutImg.length})`);

  // Pool: recent with images first, then recent without, then older with images
  const pool = [...recentWithImg, ...recentWithoutImg, ...withImg.filter(n => !recentWithImg.find(r => r.id === n.id))];

  // Make sure we have unique items
  const used = new Set();
  const uniquePool = pool.filter(n => {
    if (used.has(n.id)) return false;
    used.add(n.id);
    return true;
  });

  console.log(`Unique pool: ${uniquePool.length}`);

  // Assign to slots
  for (let i = 0; i < slotDefs.length; i++) {
    const s = slotDefs[i];
    const n = uniquePool[i % uniquePool.length];
    if (!n) continue;

    await p.homepageSlot.create({
      data: {
        slotKey: s.slotKey,
        label: s.label,
        type: 'EXTERNAL',
        externalNewsId: n.id,
        isActive: true,
        order: s.order,
      },
    });
  }

  console.log(`\nAssigned ${slotDefs.length} slots`);

  // Verify
  const slots = await p.homepageSlot.findMany({ include: { externalNews: true } });
  console.log('\n=== Verification ===');
  for (const s of slots) {
    const n = s.externalNews;
    const hasImg = n && n.image && n.image.length > 10;
    const date = n?.publishedAt ? new Date(n.publishedAt).toLocaleDateString('fa-IR') : 'N/A';
    const title = n?.title?.substring(0, 50) || 'N/A';
    console.log(`${s.slotKey.padEnd(15)} [${hasImg ? 'IMG' : '---'}] ${date.padEnd(12)} ${title}`);
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
