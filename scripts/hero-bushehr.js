const { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();
var BUSHEHR = /بوشهر(ی|ستان)?|عسلویه|کنگان|گناوه|(?<![مد])دیر(?!کل|یت|عامل)|تنگستان|دیلم|خارگ|برازجان|دشتستان|جم‌پیلن|کیمیای پارس|پارس جنوبی|نخل تقی|سیراف|اهرم|چاه‌مبارک|پارسیان/i;
function isB(n) { return BUSHEHR.test(n.title) || BUSHEHR.test(n.description || ''); }
function hasImg(n) { return n.image && n.image.length > 10 && n.image.startsWith('http'); }
var slots = [
  ['hero-main','خبر اصلی',0],['hero-side-1','خبر فرعی ۱',1],['hero-side-2','خبر فرعی ۲',2],
  ['breaking-1','فوری ۱',3],['breaking-2','فوری ۲',4],['breaking-3','فوری ۳',5],
  ['breaking-4','فوری ۴',6],['breaking-5','فوری ۵',7],
  ['latest-1','آخرین ۱',8],['latest-2','آخرین ۲',9],['latest-3','آخرین ۳',10],
  ['latest-4','آخرین ۴',11],['latest-5','آخرین ۵',12],['latest-6','آخرین ۶',13],
  ['latest-7','آخرین ۷',14],['latest-8','آخرین ۸',15],['latest-9','آخرین ۹',16],
  ['latest-10','آخرین ۱۰',17],
  ['analysis-1','تحلیل ۱',18],['analysis-2','تحلیل ۲',19],['analysis-3','تحلیل ۳',20],
];
async function main() {
  await p.homepageSlot.deleteMany();
  var all = await p.externalNews.findMany({where:{status:'APPROVED'},orderBy:{publishedAt:'desc'}});
  var bImg = all.filter(function(n){return isB(n)&&hasImg(n);});
  var nImg = all.filter(function(n){return !isB(n)&&hasImg(n);});
  console.log('Bushehr img:'+bImg.length+' National img:'+nImg.length);
  var used={},bi=0,ni=0;
  for(var i=0;i<slots.length;i++){
    var s=slots[i],n=null;
    if(i<=2){
      for(var a=0;a<bImg.length;a++){var idx=(bi+a)%bImg.length;if(!used[bImg[idx].id]){n=bImg[idx];bi=(idx+1)%bImg.length;break;}}
      if(!n)for(var a=0;a<nImg.length;a++){var idx=(ni+a)%nImg.length;if(!used[nImg[idx].id]){n=nImg[idx];ni=(idx+1)%nImg.length;break;}}
    } else {
      for(var a=0;a<nImg.length;a++){var idx=(ni+a)%nImg.length;if(!used[nImg[idx].id]){n=nImg[idx];ni=(idx+1)%nImg.length;break;}}
      if(!n)for(var a=0;a<bImg.length;a++){var idx=(bi+a)%bImg.length;if(!used[bImg[idx].id]){n=bImg[idx];bi=(idx+1)%bImg.length;break;}}
    }
    if(!n)continue;
    used[n.id]=true;
    await p.homepageSlot.create({data:{slotKey:s[0],label:s[1],type:'EXTERNAL',externalNewsId:n.id,isActive:true,order:s[2]}});
  }
  var sl=await p.homepageSlot.findMany({include:{externalNews:true}});
  console.log('Filled:'+sl.length);
  for(var j=0;j<sl.length;j++){
    var nn=sl[j].externalNews;
    var b=isB(nn)?'B':'N';
    var t=nn?nn.title.substring(0,55):'?';
    console.log(b+' '+sl[j].slotKey.padEnd(15)+' '+t);
  }
  await p.$disconnect();
}
main().catch(function(e){console.error(e);process.exit(1);});
