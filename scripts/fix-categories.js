const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();
async function main() {
  var bushehrSources = ['بوشهر خبر', 'بوشهر نیوز', 'پی جی نیوز', 'کارانه بوشهر', 'ندای استان', 'سوک نیوز'];
  var bushehrKeywords = /بوشهر|عسلویه|کنگان|گناوه|(?<![مد])دیر(?!کل|یت|عامل)|تنگستان|دیلم|خارگ|برازجان|دشتستان|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف|اهرم|چاه‌مبارک|پارسیان/i;
  
  var all = await p.externalNews.findMany({where:{status:'APPROVED'}});
  var updated = 0;
  
  for (var n of all) {
    var isBushehr = bushehrSources.indexOf(n.sourceName) >= 0 || bushehrKeywords.test(n.title);
    var cat = isBushehr ? 'بوشهر' : 'ملی';
    if (n.category !== cat) {
      await p.externalNews.update({where:{id:n.id}, data:{category:cat}});
      updated++;
    }
  }
  console.log('Updated: ' + updated + ' / ' + all.length);
  
  var cats = await p.externalNews.groupBy({by:['category'],_count:true,where:{status:'APPROVED'}});
  cats.forEach(function(c) { console.log(c.category + ': ' + c._count); });
  
  await p.$disconnect();
}
main();
