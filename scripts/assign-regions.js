// اختصاص خودکار اخبار تایید شده به بخش شهر/روستای شهرستان‌های بوشهر بر اساس کلیدواژه‌ها
const { PrismaClient } = require('@prisma/client');
const { detectRegion } = require('../src/lib/regions-core.js');
const p = new PrismaClient();

async function main() {
  const news = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, title: true, description: true, region: true, category: true },
  });

  let assigned = 0;
  let changed = 0;
  const perRegion = {};
  for (const n of news) {
    const region = detectRegion({ title: n.title, description: n.description });
    if (region) assigned++;
    if (region !== n.region) {
      await p.externalNews.update({ where: { id: n.id }, data: { region } });
      changed++;
    } else if (!region && n.region) {
      // region قبلی اشتباه است (با کد قدیمی و کلیدواژه ساده تنظیم شده) → پاکش کن
      await p.externalNews.update({ where: { id: n.id }, data: { region: null } });
      changed++;
    }
    if (region) perRegion[region] = (perRegion[region] || 0) + 1;
  }

  console.log('total:', news.length);
  console.log('region assigned:', assigned);
  console.log('rows changed:', changed);
  console.log('distribution:');
  Object.entries(perRegion).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(k).padEnd(20), v));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });