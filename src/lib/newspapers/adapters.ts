import { fetchText, downloadImage, type DownloadedImage } from './image';
import { todayNeedles, type TehranDay } from './date';

// نتیجه خام یک آداپتر: کاندید تصویر + شواهد برای امتیازدهی
export interface CoverCandidate {
  imageUrl: string;
  pageUrl: string;
  title?: string;
  discoveredDate?: string;
  evidence: {
    dateMatch: boolean;
    nameMatch: boolean;
    official: boolean;
    caption?: string;
  };
}

export interface SourceLike {
  id: string;
  name: string;
  type: string;
  url: string | null;
  parserType: string | null;
  configuration: string | null;
}

export interface PaperLike {
  id: string;
  name: string;
  slug: string;
  website: string | null;
}

function parseConfig(src: SourceLike): Record<string, any> {
  try {
    return src.configuration ? JSON.parse(src.configuration) : {};
  } catch {
    return {};
  }
}

function absolutize(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

export interface BaseAdapter {
  fetchCandidate(src: SourceLike, paper: PaperLike, day: TehranDay): Promise<CoverCandidate>;
}

// --- سایت رسمی / خبرگزاری: بهترین <img> صفحه ---
export class OfficialWebsiteAdapter implements BaseAdapter {
  async fetchCandidate(src: SourceLike, paper: PaperLike, day: TehranDay): Promise<CoverCandidate> {
    const cfg = parseConfig(src);
    const pageUrl = cfg.pageUrl || src.url || paper.website;
    if (!pageUrl) throw new Error('no-page-url');
    const html = await fetchText(pageUrl);
    const needles = todayNeedles(day);
    const dateOnPage = needles.some((n) => html.includes(n));

    // الگوی دقیق و تأییدشده (مثل جلد کیهان): اولین URL منطبق برنده است
    if (cfg.imgPattern) {
      try {
        const re = new RegExp(cfg.imgPattern, 'i');
        const all: string[] = [];
        const attrRe = /(?:src|href)\s*=\s*"([^"]+)"|(?:src|href)\s*=\s*'([^']+)'/gi;
        let am: RegExpExecArray | null;
        while ((am = attrRe.exec(html))) all.push(am[1] || am[2]);
        const hit = all.find((u) => re.test(u));
        if (hit) {
          return {
            imageUrl: absolutize(hit, pageUrl),
            pageUrl,
            evidence: { dateMatch: dateOnPage, nameMatch: true, official: src.type === 'official' },
          };
        }
      } catch {}
    }

    const keywords: string[] = cfg.keywords || ['صفحه اول', 'جلد', 'نسخه چاپی', 'پیشخوان', paper.name];
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let best: { url: string; score: number; alt: string } | null = null;
    let m: RegExpExecArray | null;
    let checked = 0;
    while ((m = imgRe.exec(html)) && checked < 300) {
      checked++;
      const tag = m[0];
      let url = m[1];
      if (url.startsWith('data:') || url.endsWith('.svg')) continue;
      const alt = (tag.match(/alt=["']([^"']*)["']/i)?.[1] || '').slice(0, 200);
      const w = Number(tag.match(/width=["']?(\d+)/i)?.[1] || 0);
      const h = Number(tag.match(/height=["']?(\d+)/i)?.[1] || 0);
      let score = 0;
      const hay = `${url} ${alt}`;
      for (const k of keywords) if (k && hay.includes(k)) score += 30;
      if (w >= 500 || h >= 600) score += 15; // ابعاد بزرگ در تگ
      if (/logo|icon|avatar|banner|ads/i.test(url)) score -= 50;
      url = absolutize(url, pageUrl);
      if (!best || score > best.score) best = { url, score, alt };
    }
    if (!best || best.score <= 0) throw new Error('no-candidate');
    return {
      imageUrl: best.url,
      pageUrl,
      title: best.alt || undefined,
      evidence: { dateMatch: dateOnPage, nameMatch: best.score >= 30, official: src.type === 'official' },
    };
  }
}

// --- تلگرام: پست امروزِ حاوی جلد از صفحه عمومی t.me/s ---
const COVER_WORDS = /صفحه.?اول|جلد|پیشخوان|نسخه.?چاپی/i;

export class TelegramAdapter implements BaseAdapter {
  async fetchCandidate(src: SourceLike, paper: PaperLike, day: TehranDay): Promise<CoverCandidate> {
    const cfg = parseConfig(src);
    const channel: string | undefined = cfg.telegram_channel || (src.url ? src.url.split('t.me/')[1]?.split(/[/?]/)[0] : undefined);
    if (!channel) throw new Error('no-channel');
    const pageUrl = `https://t.me/s/${channel}`;
    const html = await fetchText(pageUrl);
    if (html.includes('tgme_page_title') && /not found|does not exist/i.test(html)) throw new Error('channel-not-found');

    // بلوک‌های پیام — همه پست‌های عکس‌دار امروز را جمع کن، بعد امتیاز بده
    const blocks = html.split('tgme_widget_message_wrap').slice(1);
    const todays: { img: string; caption: string; dt: string; score: number }[] = [];
    let photoBlocks = 0;
    const seenHours = new Set<string>();
    for (const b of blocks) {
      // استخراج تلورانس‌دار عکس: هر background-image (با/بدون فاصله)، بعد img تگ، بعد الگوی قدیمی
      let imgUrl: string | null = null;
      const bgAll = [...b.matchAll(/background-image\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi)].map((m) => m[1]);
      imgUrl = bgAll.find((u) => /telegram\.org|t\.me/i.test(u)) || bgAll[0] || null;
      if (!imgUrl) {
        const im = b.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (im && !/emoji|sticker|avatar|logo/i.test(im[1])) imgUrl = im[1];
      }
      if (!imgUrl) {
        const fm = b.match(/(https:\/\/cdn\d*\.telegram\.org\/file\/[A-Za-z0-9_-]+)/);
        if (fm) imgUrl = fm[1];
      }
      const dtM0 = b.match(/datetime="([^"]+)"/);
      if (dtM0?.[1]) seenHours.add(dtM0[1].slice(0, 13));
      if (!imgUrl) continue;
      if (imgUrl.startsWith('/')) imgUrl = `https://t.me${imgUrl}`;
      photoBlocks++;
      const imgM = [imgUrl, imgUrl.replace(/&amp;/g, '&')];
      const txtM = b.match(/tgme_widget_message_text[^>]*>([\s\S]{0,2000}?)(<\/div>)/);
      const rawTxt = txtM ? txtM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      const dtM = b.match(/datetime="([^"]+)"/);
      const dt = dtM?.[1] || '';
      if (!this.isToday(dt, day)) continue;
      let score = 0;
      if (COVER_WORDS.test(rawTxt)) score += 50;
      if (rawTxt.includes(paper.name)) score += 25;
      if (/روزنامه/.test(rawTxt)) score += 10;
      todays.push({ img: imgM[1], caption: rawTxt.slice(0, 300), dt, score });
    }
    if (todays.length === 0) {
      const hours = [...seenHours].slice(-6).join(',');
      throw new Error(`no-posts-today(photos:${photoBlocks} blocks:${blocks.length} html:${html.length} hours:[${hours}])`);
    }
    // بهترین کپشن؛ مساوی → قدیمی‌ترین امروز (جلد معمولاً اول صبح است)
    todays.sort((a, b) => b.score - a.score);
    const top = todays[0]; // سورت پایدار: مساوی‌ها قدیمی‌ترین (اول صبح) اول می‌ماند
    return {
      imageUrl: top.img,
      pageUrl,
      title: top.caption || undefined,
      discoveredDate: top.dt,
      evidence: {
        dateMatch: true,
        nameMatch: top.score >= 25,
        official: true,
        caption: top.caption,
      },
    };
  }

  private isToday(iso: string, day: TehranDay): boolean {
    if (!iso) return false;
    try {
      const d = new Date(iso);
      // مقایسه با روز تهران (UTC+3:30)
      const tehran = new Date(d.getTime() + (3.5 * 60 + d.getTimezoneOffset()) * 60000);
      return tehran.getUTCFullYear() === day.gy && tehran.getUTCMonth() + 1 === day.gm && tehran.getUTCDate() === day.gd;
    } catch {
      return false;
    }
  }
}

// --- دستی: فقط از مسیر آپلود ادمین (در موتور خودکار استفاده نمی‌شود) ---
// تشخیص عیب صفحه کانال تلگرام (برای دکمه تست پنل)
export async function debugTelegramPage(src: SourceLike): Promise<any> {
  const cfg = (() => { try { return src.configuration ? JSON.parse(src.configuration) : {}; } catch { return {}; } })();
  const channel: string | undefined = cfg.telegram_channel || (src.url ? src.url.split('t.me/')[1]?.split(/[/?]/)[0] : undefined);
  if (!channel) return { channel: null };
  const pageUrl = `https://t.me/s/${channel}`;
  const dbg: any = { channel, pageUrl };
  try {
    const html = await fetchText(pageUrl);
    dbg.htmlLen = html.length;
    dbg.notFound = /tgme_page_title/.test(html) && /does not exist|not found/i.test(html);
    const blocks = html.split('tgme_widget_message_wrap').slice(1);
    dbg.blocks = blocks.length;
    let photos = 0;
    const dts = new Set<string>();
    for (const b of blocks) {
      if (/background-image\s*:\s*url\(/i.test(b) || /<img[^>]+src=/i.test(b) || /cdn\d*\.telegram\.org\/file\//.test(b)) photos++;
      const m = b.match(/datetime="([^"]+)"/);
      if (m) dts.add(m[1].slice(0, 13));
    }
    dbg.photoBlocks = photos;
    dbg.sampleHours = [...dts].slice(-8);
    return dbg;
  } catch (e: any) {
    dbg.fetchError = String(e?.message || e).slice(0, 120);
    return dbg;
  }
}

export class ManualAdapter implements BaseAdapter {
  async fetchCandidate(): Promise<CoverCandidate> {
    throw new Error('manual-only');
  }
}

export function getAdapter(type: string): BaseAdapter {
  if (type === 'telegram') return new TelegramAdapter();
  if (type === 'manual') return new ManualAdapter();
  return new OfficialWebsiteAdapter(); // official | news_agency | other
}

export async function downloadCandidate(c: CoverCandidate): Promise<DownloadedImage> {
  return downloadImage(c.imageUrl);
}
