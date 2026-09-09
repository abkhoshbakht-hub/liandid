// سید ۱۴ روزنامه — سایت‌ها فقط مواردی که دسترسی (HTTP 200) تأیید شده.
// هیچ URL حدسی برای سورس جلد وجود ندارد؛ سورس خودکار فقط کیهان (تأییدشده) است.
export interface NewspaperSeed {
  name: string;
  slug: string;
  category: 'national' | 'bushehr' | 'sports';
  displayOrder: number;
  website?: string;
}

export const NEWSPAPER_SEEDS: NewspaperSeed[] = [
  // سراسری
  { name: 'ایران', slug: 'iran', category: 'national', displayOrder: 1, website: 'https://irannewspaper.ir' },
  { name: 'همشهری', slug: 'hamshahri', category: 'national', displayOrder: 2, website: 'https://www.hamshahrionline.ir' },
  { name: 'شرق', slug: 'shargh', category: 'national', displayOrder: 3, website: 'https://www.sharghdaily.com' },
  { name: 'اعتماد', slug: 'etemad', category: 'national', displayOrder: 4, website: 'https://etemadnewspaper.ir' },
  { name: 'دنیای اقتصاد', slug: 'donya-e-eqtesad', category: 'national', displayOrder: 5, website: 'https://donya-e-eqtesad.com' },
  { name: 'کیهان', slug: 'kayhan', category: 'national', displayOrder: 6, website: 'https://kayhan.ir' },
  { name: 'جوان', slug: 'javan', category: 'national', displayOrder: 7, website: 'https://www.javanonline.ir' },
  { name: 'وطن امروز', slug: 'vatan-emrooz', category: 'national', displayOrder: 8, website: 'https://www.vatanemrooz.ir' },
  { name: 'فرهیختگان', slug: 'farhikhtegan', category: 'national', displayOrder: 9 },
  { name: 'خراسان', slug: 'khorasan', category: 'national', displayOrder: 10 },
  // بوشهر
  { name: 'بامداد جنوب', slug: 'bamdad-jonoob', category: 'bushehr', displayOrder: 11 },
  { name: 'پیام عسلویه', slug: 'payam-asaluyeh', category: 'bushehr', displayOrder: 12 },
  // ورزشی
  { name: 'ابرار ورزشی', slug: 'abrar-varzeshi', category: 'sports', displayOrder: 13, website: 'https://abrarvarzeshi.ir' },
  { name: 'گل', slug: 'goal', category: 'sports', displayOrder: 14, website: 'https://goaldaily.ir' },
];

// تنها سورس خودکار تأییدشده: جلد روزانه کیهان از سایت رسمی
export const KAYHAN_SOURCE = {
  slug: 'kayhan',
  name: 'سایت رسمی کیهان',
  type: 'official',
  url: 'https://kayhan.ir/',
  priority: 0,
  configuration: JSON.stringify({
    pageUrl: 'https://kayhan.ir/',
    imgPattern: 'files/fa/publication/pages/[^"\'\\s]+\\.jpe?g',
    keywords: ['کیهان', 'صفحه اول'],
  }),
};
