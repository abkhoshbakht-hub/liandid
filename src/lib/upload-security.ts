// امنیت و قرارداد آپلود مدیا — توابع خالص (تست‌پذیر بدون توکن)
// تصاویر: همان محدودیت‌های فعلی پروژه. ویدئو: فقط آماده‌سازی Storage، سقف جدا.

export const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

// SVG عمداً مجاز نیست (XSS)
export const VIDEO_MIME_TO_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export const VIDEO_MAX_MB = 100;

export type MediaKind = 'image' | 'video';

export interface ValidatedUpload {
  kind: MediaKind;
  mime: string;
  ext: string;
}

// اعتبارسنجی فقط از روی MIME واقعی فایل (نه extension کاربر)
export function validateUploadFile(mime: string | null | undefined, sizeBytes: number, maxImageMb: number): ValidatedUpload {
  const m = (mime || '').toLowerCase().split(';')[0].trim();
  const imgExt = IMAGE_MIME_TO_EXT[m];
  if (imgExt) {
    const cap = Math.min(Math.max(maxImageMb, 1), 10) * 1024 * 1024;
    if (sizeBytes <= 0 || sizeBytes > cap) {
      throw new Error(`حجم عکس نباید بیشتر از ${Math.min(Math.max(maxImageMb, 1), 10)} مگابایت باشد`);
    }
    return { kind: 'image', mime: m, ext: imgExt };
  }
  const vidExt = VIDEO_MIME_TO_EXT[m];
  if (vidExt) {
    if (sizeBytes <= 0 || sizeBytes > VIDEO_MAX_MB * 1024 * 1024) {
      throw new Error(`حجم ویدئو نباید بیشتر از ${VIDEO_MAX_MB} مگابایت باشد`);
    }
    return { kind: 'video', mime: m, ext: vidExt };
  }
  throw new Error('نوع فایل مجاز نیست (فقط عکس JPG/PNG/WebP/GIF/AVIF و ویدئو MP4/WebM/MOV)');
}

// مسیر امن و بدون collision — هیچ ورودی کاربر در مسیر نیست
export function buildBlobPath(uid: string, ext: string): string {
  const safeUid = (uid || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'file';
  const safeExt = (ext || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin';
  return `articles/${safeUid}.${safeExt}`;
}
