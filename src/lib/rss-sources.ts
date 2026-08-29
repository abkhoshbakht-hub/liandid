export interface RssSource {
  name: string;
  url: string;
  category: string;
  logo?: string;
}

export const rssSources: RssSource[] = [
  // خبرگزاری‌های بوشهر
  { name: 'بوشهر خبر', url: 'https://bushehrkhabar.com/feed/', category: 'بوشهر' },
  { name: 'بوشهر نیوز', url: 'https://bushehrnews.ir/feed/', category: 'بوشهر' },
  { name: 'پی جی نیوز', url: 'https://www.pgnews.ir/feed/', category: 'بوشهر' },
  { name: 'کارانه بوشهر', url: 'https://karanehbushehr.ir/?feed=rss2', category: 'بوشهر' },
  { name: 'ندای استان', url: 'https://nedayostan.ir/?feed=rss2', category: 'بوشهر' },
  { name: 'سوک نیوز', url: 'https://sooknews.ir/?feed=rss2', category: 'بوشهر' },
  
  // خبرگزاری‌های ملی
  { name: 'ایرنا', url: 'https://www.irna.ir/rss', category: 'ملی' },
  { name: 'ایسنا', url: 'https://www.isna.ir/rss', category: 'ملی' },
  { name: 'مهر', url: 'https://www.mehrnews.com/rss', category: 'ملی' },
  { name: 'فارس', url: 'https://www.farsnews.ir/rss', category: 'ملی' },
  { name: 'تسنیم', url: 'https://www.tasnimnews.com/rss', category: 'ملی' },
];

// RSS feeds often have different URL patterns. This is a fallback list.
export const rssFallbackSources: RssSource[] = [
  { name: 'بوشهر خبر', url: 'https://bushehrkhabar.com/rss', category: 'بوشهر' },
  { name: 'بوشهر نیوز', url: 'https://bushehrnews.ir/feed/', category: 'بوشهر' },
  { name: 'پی جی نیوز', url: 'https://www.pgnews.ir/feed/', category: 'بوشهر' },
  { name: 'ایرنا', url: 'https://www.irna.ir/service/rss', category: 'ملی' },
  { name: 'ایسنا', url: 'https://www.isna.ir/service/rss', category: 'ملی' },
  { name: 'مهر', url: 'https://www.mehrnews.com/rss/allnews', category: 'ملی' },
  { name: 'فارس', url: 'https://www.farsnews.ir/rss', category: 'ملی' },
  { name: 'تسنیم', url: 'https://www.tasnimnews.com/rss/all', category: 'ملی' },
];
