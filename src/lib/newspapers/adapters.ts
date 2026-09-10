import { fetchText, downloadImage, type DownloadedImage } from './image';
import { todayNeedles, type TehranDay } from './date';

// نتیجه خام یک آداپتر: کاندید تصویر + شواهد برای امتیازدهی
export interface CoverCandidate {
  imageUrl: string;
  pageUrl: string;
  title?: string;
  discoveredDate?: string;
  issueNumber?: string;
  evidence: {
    dateMatch: boolean;
    nameMatch: boolean;
    official: boolean;
    caption?: string;
  };
}

// نرمالایز برای تطبیق الگو: حذف نیم‌فاصله/فاصله (هم‌میهن = هم میهن = هممیهن)
export function normFa(s: string): string {
  return (s || '').replace(/[\u200C\u200B\s]+/g, '');
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export function faToEnDigits(s: string): string {
  return (s || '').replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

// استخراج شماره روزنامه از کپشن (مثل «شماره ۵۴۷۱»)
export function extractIssueNumber(text: string): string | undefined {
  const m = (text || '').match(/شماره\s*([۰-۹0-9][۰-۹0-9.,]*)/);
  if (!m) return undefined;
  const num = faToEnDigits(m[1]).replace(/[.,]/g, '');
  return num || undefined;
}

// آدرس واقعاً تصویری است؟ (pages/لینک‌های HTML رد می‌شوند)
export function looksLikeImageUrl(u: string): boolean {
  return /cdn\d*\.telegram\.org\/file\//i.test(u) || /\.(jpe?g|png|webp)(\?|$)/i.test(u);
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

// کانفیگ سورس رسمی (آرشیو یا صفحه مستقیم) — همه اختیاری تا سورس‌های قدیمی نشکنند
export interface OfficialCfg {
  pageUrl?: string;
  archiveUrl?: string;
  linkText?: string;
  itemPattern?: string;
  idPattern?: string;
  ogImage?: boolean;
  imgPattern?: string;
  imgPatternList?: string[];
  datePath?: boolean;
  preferLargestWidth?: boolean;
  imgSwap?: [string, string];
  keywords?: string[];
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
    // حالت آرشیو رسمی: صفحه فهرست → جدیدترین شماره (بزرگ‌ترین شناسه) → og:image یا الگوی عکس
    if (cfg.archiveUrl || cfg.linkText) {
      return this.fetchFromArchive(src, paper, day, cfg);
    }
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

  // فهرست آرشیو → جدیدترین شماره → تصویر جلد (بدون هیچ URL حدسی؛ همه از HTML خوانده می‌شود)
  private async fetchFromArchive(src: SourceLike, paper: PaperLike, day: TehranDay, cfg: OfficialCfg): Promise<CoverCandidate> {
    const listUrl = cfg.archiveUrl || cfg.pageUrl || src.url || paper.website;
    if (!listUrl) throw new Error('no-page-url');
    const listHtml = await fetchText(listUrl);
    let issueHref = '';
    if (cfg.linkText) {
      // اولین لینکی که متنش حاوی عبارت مشخص است (مثل «نسخه کامل شماره امروز»)
      const aRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,300}?)<\/a>/gi;
      let am: RegExpExecArray | null;
      while ((am = aRe.exec(listHtml))) {
        const txt = am[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        if (txt.includes(cfg.linkText)) { issueHref = am[1]; break; }
      }
      if (!issueHref) throw new Error('no-issue-link');
    } else if (cfg.itemPattern) {
      // جدیدترین شماره = لینکی که بزرگ‌ترین شناسه عددی (۴+ رقم) را دارد؛ شناسه‌ها صعودی‌اند
      const hrefRe = /href=(["'])([^"']+)\1/gi;
      const itemRe = new RegExp(cfg.itemPattern, 'i');
      const idRe = cfg.idPattern ? new RegExp(cfg.idPattern, 'i') : null;
      let bestId = 0;
      let hm: RegExpExecArray | null;
      while ((hm = hrefRe.exec(listHtml))) {
        const href = hm[2];
        if (!itemRe.test(href)) continue;
        let id = 0;
        if (idRe) {
          const im = href.match(idRe);
          if (im) id = Number(im[1] || im[0].replace(/\D/g, ''));
        } else {
          const ids = href.match(/\d{4,}/g);
          if (ids) id = Math.max(...ids.map(Number));
        }
        if (id > bestId) { bestId = id; issueHref = href; }
      }
      if (!issueHref) throw new Error('no-issue-link');
    } else {
      throw new Error('no-issue-selector');
    }
    const issueUrl = absolutize(issueHref, listUrl);
    const issueHtml = await fetchText(issueUrl);
    const needles = todayNeedles(day);
    const dateOnPage = needles.some((n) => issueHtml.includes(n));

    let imageUrl = '';
    if (cfg.ogImage) {
      const og = issueHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        || issueHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      if (!og) throw new Error('no-og-image');
      imageUrl = absolutize(og[1], issueUrl);
    } else {
      const patterns: string[] = cfg.imgPatternList || (cfg.imgPattern ? [cfg.imgPattern] : []);
      if (patterns.length === 0) throw new Error('no-img-selector');
      const pad = (n: number) => String(n).padStart(2, '0');
      const datePath = `/${day.jy}/${pad(day.jm)}/${pad(day.jd)}/`;
      for (const p of patterns) {
        const re = new RegExp(p, 'gi');
        const hits: string[] = [];
        let hm: RegExpExecArray | null;
        while ((hm = re.exec(issueHtml))) {
          const u = hm[1] || hm[0];
          if (u.startsWith('data:') || u.endsWith('.svg')) continue;
          if (/logo|icon|avatar|banner|ads/i.test(u)) continue;
          if (cfg.datePath && !u.includes(datePath)) continue;
          hits.push(u);
        }
        if (hits.length === 0) continue;
        let pick = hits[0];
        if (cfg.preferLargestWidth) {
          let bestW = -1;
          for (const h of hits) {
            const wm = h.match(/[?&]width=(\d+)/i);
            const w = wm ? Number(wm[1]) : 0;
            if (w > bestW) { bestW = w; pick = h; }
          }
        }
        imageUrl = absolutize(pick, issueUrl);
        break;
      }
      if (!imageUrl) throw new Error('no-candidate');
    }
    if (cfg.imgSwap && Array.isArray(cfg.imgSwap) && cfg.imgSwap.length === 2) {
      try {
        const swapped = imageUrl.replace(new RegExp(cfg.imgSwap[0]), cfg.imgSwap[1]);
        if (swapped !== imageUrl) imageUrl = swapped;
      } catch {
        // نادیده گرفتن الگوی نامعتبر
      }
    }
    const titleM = issueHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || issueHtml.match(/<title[^>]*>([^<]{0,300})<\/title>/i);
    const title = titleM?.[1]?.replace(/\s+/g, ' ').trim();
    return {
      imageUrl,
      pageUrl: issueUrl,
      title,
      evidence: { dateMatch: dateOnPage, nameMatch: !!title && title.includes(paper.name), official: true },
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

    // بلوک‌های پیام — فقط پست امروز + فقط جلد (الگوی اختصاصی کانال) + فقط URL تصویری
    const blocks = html.split('tgme_widget_message_wrap').slice(1);
    const coverPatterns: string[] | undefined = Array.isArray(cfg.coverPatterns) ? cfg.coverPatterns : undefined;
    const todays: { img: string; caption: string; dt: string; score: number; num?: string }[] = [];
    let photoBlocks = 0;
    let skippedNonImage = 0;
    const seenHours = new Set<string>();
    for (const b of blocks) {
      const dtM0 = b.match(/datetime="([^"]+)"/);
      if (dtM0?.[1]) seenHours.add(dtM0[1].slice(0, 13));
      const dtM = b.match(/datetime="([^"]+)"/);
      const dt = dtM?.[1] || '';
      if (!this.isToday(dt, day)) continue;
      const txtM = b.match(/tgme_widget_message_text[^>]*>([\s\S]{0,2000}?)(<\/div>)/);
      const rawTxt = txtM ? txtM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      const nTxt = normFa(rawTxt);
      // الگوی اختصاصی کانال (اگر تعریف شده): حتماً باید بخورد — وگرنه عکس خبری عادی است
      if (coverPatterns && coverPatterns.length > 0) {
        const hit = coverPatterns.some((p) => nTxt.includes(normFa(p)));
        if (!hit) continue;
      }
      // استخراج عکس — فقط آدرس واقعاً تصویری قبول است (صفحه HTML هرگز)
      const cands: string[] = [];
      for (const m of b.matchAll(/background-image\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi)) cands.push(m[1]);
      const im = b.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (im && !/emoji|sticker|avatar|logo/i.test(im[1])) cands.push(im[1]);
      const fm = b.match(/(https:\/\/cdn\d*\.telegram\.org\/file\/[A-Za-z0-9_-]+)/);
      if (fm) cands.push(fm[1]);
      const imgUrl = cands
        .map((u) => (u.startsWith('/') ? `https://t.me${u}` : u.replace(/&amp;/g, '&')))
        .find((u) => looksLikeImageUrl(u));
      if (!imgUrl) { skippedNonImage++; continue; }
      photoBlocks++;
      let score = 0;
      if (COVER_WORDS.test(rawTxt)) score += 50;
      if (coverPatterns && coverPatterns.some((p) => nTxt.includes(normFa(p)))) score += 40;
      if (rawTxt.includes(paper.name) || nTxt.includes(normFa(paper.name))) score += 25;
      if (/روزنامه/.test(rawTxt)) score += 10;
      todays.push({ img: imgUrl, caption: rawTxt.slice(0, 300), dt, score, num: extractIssueNumber(rawTxt) });
    }
    if (todays.length === 0) {
      const hours = [...seenHours].slice(-6).join(',');
      throw new Error(`no-posts-today(photos:${photoBlocks} skippedHtml:${skippedNonImage} blocks:${blocks.length} html:${html.length} hours:[${hours}])`);
    }
    // بهترین کپشن؛ مساوی → قدیمی‌ترین امروز (جلد معمولاً اول صبح است)
    todays.sort((a, b) => b.score - a.score);
    const top = todays[0]; // سورت پایدار: مساوی‌ها قدیمی‌ترین (اول صبح) اول می‌ماند
    return {
      imageUrl: top.img,
      pageUrl,
      title: top.caption || undefined,
      discoveredDate: top.dt,
      issueNumber: top.num,
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

// --- تسنیم (پیشخوان مطبوعات): فقط fallback، تطبیق سخت‌گیرانه نام+تاریخ، هرگز انتشار خودکار ---
export class TasnimAdapter implements BaseAdapter {
  async fetchCandidate(src: SourceLike, paper: PaperLike, day: TehranDay): Promise<CoverCandidate> {
    const cfg = parseConfig(src);
    const listUrl = cfg.keywordUrl || src.url || 'https://www.tasnimnews.ir/fa/keyword/2297/';
    const listHtml = await fetchText(listUrl);
    // جدیدترین مطلب «صفحه اول مطبوعات»
    const aRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi;
    let articleHref = '';
    let am: RegExpExecArray | null;
    while ((am = aRe.exec(listHtml))) {
      const txt = am[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      if (/صفحه اول مطبوعات|پیشخوان مطبوعات/.test(txt)) { articleHref = am[1]; break; }
    }
    if (!articleHref) throw new Error('tasnim-no-article');
    const articleUrl = absolutize(articleHref, listUrl);
    const html = await fetchText(articleUrl);
    const needles = todayNeedles(day);
    if (!needles.some((n) => html.includes(n))) throw new Error('tasnim-stale-article');
    // همه تصاویر + متن اطرافشان؛ فقط عکسی که نام روزنامه کنارش باشد
    const nName = normFa(paper.name);
    const cands: { url: string; ctx: string }[] = [];
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (og) cands.push({ url: og[1], ctx: (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || '') });
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let im: RegExpExecArray | null;
    while ((im = imgRe.exec(html))) {
      const tag = im[0];
      const url = im[1];
      if (url.startsWith('data:') || url.endsWith('.svg')) continue;
      if (/logo|icon|avatar|banner|ads|emoji/i.test(url)) continue;
      const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] || '';
      const start = Math.max(0, (im.index || 0) - 400);
      const ctx = `${alt} ${html.slice(start, (im.index || 0) + 400).replace(/<[^>]+>/g, ' ')}`;
      cands.push({ url, ctx });
    }
    const match = cands.find((c) => normFa(c.ctx).includes(nName));
    if (!match) throw new Error('tasnim-no-match');
    const imageUrl = absolutize(match.url, articleUrl);
    if (!looksLikeImageUrl(imageUrl) && !/tasnimnews\.ir/i.test(imageUrl)) throw new Error('tasnim-no-match');
    const titleM = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const title = titleM?.[1]?.replace(/\s+/g, ' ').trim();
    return {
      imageUrl,
      pageUrl: articleUrl,
      title,
      issueNumber: extractIssueNumber(`${title || ''} ${match.ctx}`),
      evidence: { dateMatch: true, nameMatch: true, official: false },
    };
  }
}

export class ManualAdapter implements BaseAdapter {
  async fetchCandidate(): Promise<CoverCandidate> {
    throw new Error('manual-only');
  }
}

export function getAdapter(type: string): BaseAdapter {
  if (type === 'telegram') return new TelegramAdapter();
  if (type === 'tasnim') return new TasnimAdapter();
  if (type === 'manual') return new ManualAdapter();
  return new OfficialWebsiteAdapter(); // official | news_agency | other
}

export async function downloadCandidate(c: CoverCandidate): Promise<DownloadedImage> {
  return downloadImage(c.imageUrl);
}
