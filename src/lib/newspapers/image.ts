import crypto from 'crypto';
import sharp from 'sharp';

export const FETCH_UA =
  'Mozilla/5.0 (compatible; LianDidBot/1.0; +https://liandid.ir) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const MAX_BYTES = 15 * 1024 * 1024;

export interface DownloadedImage {
  buffer: Buffer;
  mime: string;
  width: number;
  height: number;
  hash: string;
}

export async function downloadImage(url: string, timeoutMs = 20000): Promise<DownloadedImage> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': FETCH_UA, Accept: 'image/*,*/*' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.startsWith('image/') && !ct.startsWith('application/octet-stream')) {
      throw new Error(`not-image: ${ct}`);
    }
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 20 * 1024) throw new Error('too-small');
    if (ab.byteLength > MAX_BYTES) throw new Error('too-large');
    const buffer = Buffer.from(ab);
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error('bad-image');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { buffer, mime: `image/${meta.format || 'jpeg'}`, width: meta.width, height: meta.height, hash };
  } finally {
    clearTimeout(t);
  }
}

export async function fetchText(url: string, timeoutMs = 20000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': FETCH_UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

// نسخه وب (WebP، حداکثر ۱۲۰۰px) + بندانگشتی (WebP، ۴۰۰px)
export async function processCover(buffer: Buffer): Promise<{ original: Buffer; web: Buffer; thumb: Buffer }> {
  const web = await sharp(buffer)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 65 })
    .toBuffer();
  return { original: buffer, web, thumb };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
