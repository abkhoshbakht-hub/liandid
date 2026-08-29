// هسته مشترک تشخیص شهرستان/بخش استان بوشهر (CJS) - قابل استفاده هم در Next و هم در اسکریپت‌های node
const shahrestanList = [
  { slug: 'booshehr', name: 'بوشهر', city: ['بوشهر', 'بندر بوشهر', 'جزیره خارگ', 'خارگ'], village: ['عالی‌شهر', 'عیش‌آباد', 'روستای چاهک', 'شغاب'] },
  { slug: 'dayer', name: 'دیر', city: ['دیر', 'بندر دیر', 'بردخون', 'آبدان'], village: ['لاور', 'دوراهک', 'اهرم', 'وحدتیه دیر'] },
  { slug: 'deylam', name: 'دیلم', city: ['دیلم', 'بندر امام حسن'], village: ['وحدتیه', 'روستای امام حسن'] },
  { slug: 'genaveh', name: 'گناوه', city: ['گناوه', 'بندر گناوه', 'ریگ'], village: ['بندر ریگ', 'روستای ساحلی'] },
  { slug: 'dashtestan', name: 'دشتستان', city: ['برازجان', 'آب‌پخش', 'بوشکان', 'تنگ ارم', 'سعدآباد', 'شبانکاره', 'دلوار', 'وحدتیه', 'کلمه'], village: ['روستای', 'دهستان'] },
  { slug: 'dashti', name: 'دشتی', city: ['خورموج', 'کاکی', 'شنبه', 'بوالخیر', 'طسوج'], village: ['روستای', 'دهستان'] },
  { slug: 'tangestan', name: 'تنگستان', city: ['اهرم', 'دلوار', 'آباد'], village: ['روستای', 'دهستان'] },
  { slug: 'kangan', name: 'کنگان', city: ['کنگان', 'بندر کنگان', 'سیراف', 'بنک'], village: ['روستای', 'دهستان'] },
  { slug: 'asaluyeh', name: 'عسلویه', city: ['عسلویه', 'نخل تقی', 'بندر عسلویه'], village: ['روستای', 'دهستان', 'نخل تقی'] },
  { slug: 'jam', name: 'جم', city: ['جم', 'شهر جم', 'انارستان', 'ریز'], village: ['روستای', 'دهستان'] },
  { slug: 'kharg', name: 'جزیره خارگ', city: ['خارگ', 'جزیره خارگ'], village: [] },
];

const PERSIAN_LETTERS = '\\u0600-\\u06FF';
const SUFFIX = '(?:ترین|تر|ها|های|ی|انی|اری)?';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordRegex(word) {
  return new RegExp(`(?:^|[^${PERSIAN_LETTERS}])${escapeRegExp(word)}${SUFFIX}(?=$|[^${PERSIAN_LETTERS}])`);
}

function textMatchesKeywords(text, keywords) {
  if (!text) return false;
  return keywords.some(kw => wordRegex(kw).test(text));
}

function detectRegion(n) {
  const text = `${n.title} ${n.description || ''}`;
  // شهرستان‌های دیگر اول بررسی شوند تا خبرِ دارای نام دو شهرستان، به‌درستی به شهرستان اختصاصی‌تر وصل شود
  const ordered = [...shahrestanList.filter(s => s.slug !== 'booshehr'), shahrestanList.find(s => s.slug === 'booshehr')];
  for (const sh of ordered) {
    if (textMatchesKeywords(text, sh.city)) return `${sh.slug}:city`;
    if (textMatchesKeywords(text, sh.village)) return `${sh.slug}:village`;
  }
  return null;
}

function shahrestanBySlug(slug) {
  return shahrestanList.find(s => s.slug === slug) || null;
}

function regionLabel(region) {
  const [slug, type] = String(region || '').split(':');
  const sh = shahrestanBySlug(slug);
  if (!sh) return region;
  return `${type === 'city' ? 'شهر' : 'روستا'} ${sh.name}`;
}

module.exports = {
  shahrestanList,
  escapeRegExp,
  wordRegex,
  textMatchesKeywords,
  detectRegion,
  shahrestanBySlug,
  regionLabel,
};
