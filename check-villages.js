const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Check ALL news that mention any bushehr city + village/روستا/دهستان
  const bushehrCities = ['بوشهر', 'دیر', 'دیلم', 'گناوه', 'برازجان', 'خورموج', 'اهرم', 'کنگان', 'عسلویه', 'جم', 'خارگ', 'ریگ', 'آب‌پخش', 'بردخون', 'آبدان'];
  
  for (const city of bushehrCities) {
    const count = await p.externalNews.count({
      where: {
        status: 'APPROVED',
        title: { contains: city },
        OR: [
          { title: { contains: 'روستا' } },
          { title: { contains: 'دهستان' } },
          { title: { contains: 'روستایی' } },
        ]
      }
    });
    if (count > 0) {
      const samples = await p.externalNews.findMany({
        where: {
          status: 'APPROVED',
          title: { contains: city },
          OR: [
            { title: { contains: 'روستا' } },
            { title: { contains: 'دهستان' } },
            { title: { contains: 'روستایی' } },
          ]
        },
        take: 3,
        select: { title: true, sourceName: true, publishedAt: true }
      });
      console.log(`\n${city} + روستا (${count}):`);
      samples.forEach(n => console.log(`  ${n.publishedAt?.toISOString().slice(0,10)} | ${n.sourceName} | ${n.title?.slice(0,80)}`));
    }
  }

  // Check region :village assignments
  const rv = await p.externalNews.findMany({
    where: { status: 'APPROVED', region: { contains: ':village' } },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: { title: true, sourceName: true, region: true, publishedAt: true }
  });
  console.log('\nregion :village (last 5):');
  rv.forEach(n => console.log(`  ${n.publishedAt?.toISOString().slice(0,10)} | ${n.region} | ${n.sourceName} | ${n.title?.slice(0,80)}`));

  // Check all news with village keywords
  const vk = await p.externalNews.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { title: { contains: 'روستای بوشهر' } },
        { title: { contains: 'روستاهای بوشهر' } },
        { title: { contains: 'عالی‌شهر' } },
        { title: { contains: 'شغاب' } },
        { title: { contains: 'لاور' } },
        { title: { contains: 'دوراهک' } },
        { title: { contains: 'واحدتیه' } },
        { title: { contains: 'امام حسن' } },
        { title: { contains: 'بندر ریگ' } },
        { title: { contains: 'نخل تقی' } },
        { title: { contains: 'ریز' } },
        { title: { contains: 'انارستان' } },
      ]
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: { title: true, sourceName: true, publishedAt: true }
  });
  console.log('\nvillage keywords match:');
  vk.forEach(n => console.log(`  ${n.publishedAt?.toISOString().slice(0,10)} | ${n.sourceName} | ${n.title?.slice(0,80)}`));

  // Total approved count
  const total = await p.externalNews.count({ where: { status: 'APPROVED' } });
  console.log('\nTotal approved:', total);

  await p.$disconnect();
}
main();
