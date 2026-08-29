// شهرستان‌های استان بوشهر + کلیدواژه‌های شهر و روستا با تشخیص مرز کلمه فارسی
// هسته منطقی در regions-core.js (CJS) قرار دارد تا هم Next و هم اسکریپت‌های node از آن استفاده کنند.

export { shahrestanList, escapeRegExp, wordRegex, textMatchesKeywords, detectRegion, regionLabel } from './regions-core.js';

import { shahrestanList } from './regions-core.js';

export type ShahrestanDef = {
  slug: string;
  name: string;
  city: string[];
  village: string[];
};

export const shahrestanMap: Record<string, ShahrestanDef> = Object.fromEntries(
  shahrestanList.map((s: ShahrestanDef) => [s.slug, s])
);