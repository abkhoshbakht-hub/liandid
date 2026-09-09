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

    // بلوک‌های پیام
    const blocks = html.split('tgme_widget_message_wrap').slice(1);
    let pick: { img: string; caption: string; dt: string } | null = null;
    for (const b of blocks) {
      const imgM = b.match(/background-image:url\(['"]?(https:\/\/cdn\d*\.telegram\.org\/[^'")]+)['"]?\)/);
      if (!imgM) continue;
      const txtM = b.match(/tgme_widget_message_text[^>]*>([\s\S]{0,2000}?)(<\/div>)/);
      const rawTxt = txtM ? txtM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      const dtM = b.match(/datetime="([^"]+)"/);
      const dt = dtM?.[1] || '';
      // پست امروز تهران + کپشن جلد
      if (rawTxt && COVER_WORDS.test(rawTxt) && this.isToday(dt, day)) {
        // پیام‌ها قدیمی‌به‌جدید مرتب‌اند؛ آخری (جدیدترین) را نگه می‌داریم
        pick = { img: imgM[1].replace(/&amp;/g, '&'), caption: rawTxt.slice(0, 300), dt };
      }
    }
    if (!pick) throw new Error('no-cover-post-today');
    return {
      imageUrl: pick.img,
      pageUrl,
      title: pick.caption,
      discoveredDate: pick.dt,
      evidence: {
        dateMatch: true,
        nameMatch: pick.caption.includes(paper.name),
        official: true,
        caption: pick.caption,
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
