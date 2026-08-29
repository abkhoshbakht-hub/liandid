const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();
async function main() {
  var r = await p.externalNews.findMany({where:{status:'APPROVED'},select:{sourceName:true,category:true,source:true}});
  var cats = {};
  r.forEach(function(n) {
    var k = n.sourceName + ' | cat:' + (n.category||'null') + ' | src:' + (n.source||'null');
    if (!cats[k]) cats[k] = 0;
    cats[k]++;
  });
  Object.keys(cats).forEach(function(k) { console.log(cats[k] + 'x ' + k); });
  await p.$disconnect();
}
main();
