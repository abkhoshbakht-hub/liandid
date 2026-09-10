import crypto from 'crypto';

export const FETCH_UA =
  'Mozilla/5.0 (compatible; LianDidBot/1.0; +https://liandid.ir) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const MAX_BYTES = 15 * 1024 * 1024;

// --- محافظت SSRF: فقط دامنه‌های مجاز (سایت‌های رسمی روزنامه‌ها + CDNها + تلگرام) ---
// سورس‌های دستی ادمین (تأیید صریح مدیر) از این فهرست مستثنا هستند.
const ALLOWED_HOSTS: RegExp[] = [
  /^kayhan\.ir$/,
  /^([a-z0-9-]+\.)?sharghdaily\.com$/,
  /^([a-z0-9-]+\.)?irannewspaper\.ir$/,
  /^([a-z0-9-]+\.)?inn\.ir$/,
  /^([a-z0-9-]+\.)?ettelaat\.com$/,
  /^([a-z0-9-]+\.)?jamejamdaily\.ir$/,
  /^([a-z0-9-]+\.)?javanonline\.ir$/,
  /^javann\.ir$/,
  /^([a-z0-9-]+\.)?vatanemrooz\.ir$/,
  /^([a-z0-9-]+\.)?etemadnewspaper\.ir$/,
  /^([a-z0-9-]+\.)?donya-e-eqtesad\.com$/,
  /^([a-z0-9-]+\.)?goaldaily\.ir$/,
  /^([a-z0-9-]+\.)?bamdadjonub\.ir$/,
  /^([a-z0-9-]+\.)?hamshahrionline\.ir$/,
  /^([a-z0-9-]+\.)?hammihanonline\.ir$/,
  /^([a-z0-9-]+\.)?farhikhteganonline\.ir$/,
  /^([a-z0-9-]+\.)?abrarvarzeshi\.ir$/,
  /^([a-z0-9-]+\.)?abrarnews\.com$/,
  /^([a-z0-9-]+\.)?payameasalooye\.ir$/,
  /^([a-z0-9-]+\.)?khorasannews\.com$/,
  /^([a-z0-9-]+\.)?khorasanonline\.ir$/,
  /^([a-z0-9-]+\.)?tasnimnews\.ir$/,
  /^([a-z0-9-]+\.)?pishkhan\.com$/,
  /^t\.me$/,
  /^cdn\d*\.telegram\.org$/,
];

function hostBlocked(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  if (h === 'localhost' || h === '::1' || h === '[::1]') return true;
  if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/metadata\.google|metadata\.azure|instance-data/.test(h)) return true;
  return false;
}

export function assertFetchable(rawUrl: string): string {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error('bad-url');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad-protocol');
  if (hostBlocked(u.hostname)) throw new Error('blocked-host');
  if (!ALLOWED_HOSTS.some((re) => re.test(u.hostname.toLowerCase()))) throw new Error('host-not-allowed');
  return u.toString();
}

export function assertRedirectSafe(finalUrl: string): void {
  assertFetchable(finalUrl);
}

export interface DownloadedImage {
  buffer: Buffer;
  mime: string;
  width: number;
  height: number;
  hash: string;
}

// --- تشخیص ابعاد بدون هیچ وابستگی native (pure JS) ---
export function parseImageDims(buf: Buffer): { mime: string; width: number; height: number } | null {
  if (buf.length < 24) return null;
  // PNG: امضا + IHDR
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { mime: 'image/png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { mime: 'image/gif', width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // WebP: RIFF....WEBP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') {
      const w = buf.readUInt16LE(26) & 0x3fff;
      const h = buf.readUInt16LE(28) & 0x3fff;
      if (w && h) return { mime: 'image/webp', width: w, height: h };
    } else if (chunk === 'VP8L') {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      if (w && h) return { mime: 'image/webp', width: w, height: h };
    } else if (chunk === 'VP8X') {
      const w = 1 + buf.readUIntLE(24, 3);
      const h = 1 + buf.readUIntLE(27, 3);
      if (w && h) return { mime: 'image/webp', width: w, height: h };
    }
    return null;
  }
  // JPEG: جستجوی SOF
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 4 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      if (len < 2) break;
      if ((marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc)) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        if (w && h) return { mime: 'image/jpeg', width: w, height: h };
        break;
      }
      i += 2 + len;
    }
    return null;
  }
  return null;
}

export async function downloadImage(url: string, timeoutMs = 10000): Promise<DownloadedImage> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    assertFetchable(url);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': FETCH_UA, Accept: 'image/*,*/*' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    try { assertRedirectSafe(res.url); } catch { throw new Error('redirect-blocked'); }
    const ct = res.headers.get('content-type') || '';
    if (!ct.startsWith('image/') && !ct.startsWith('application/octet-stream')) {
      throw new Error(`not-image: ${ct} url:${url.slice(0, 130)}`);
    }
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 10 * 1024) throw new Error('too-small');
    if (ab.byteLength > MAX_BYTES) throw new Error('too-large');
    const buffer = Buffer.from(ab);
    const dims = parseImageDims(buffer);
    if (!dims || !dims.width || !dims.height) throw new Error('bad-image');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { buffer, mime: dims.mime, width: dims.width, height: dims.height, hash };
  } finally {
    clearTimeout(t);
  }
}

export async function fetchText(url: string, timeoutMs = 8000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    assertFetchable(url);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': FETCH_UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    try { assertRedirectSafe(res.url); } catch { throw new Error('redirect-blocked'); }
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

// بدون sharp: نسخه اصلی نگه داشته می‌شود (بهینه‌سازی WebP در فاز بعد با سرویس خارجی)
export async function processCover(buffer: Buffer): Promise<{ original: Buffer; web: Buffer; thumb: Buffer }> {
  return { original: buffer, web: buffer, thumb: buffer };
}

export function hashBuffer(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
