// Storage قابل تعویض برای جلد روزنامه‌ها.
// پیش‌فرض: دیتابیس (base64) — بدون نیاز به حساب خارجی، همه‌جا کار می‌کند.
// اگر توکن Blob باشد: Vercel Blob. بعداً S3/R2 با همین Interface اضافه می‌شود.

export type CoverKind = 'original' | 'web' | 'thumb';

export interface CoverStorage {
  save(buffer: Buffer, opts: { paperSlug: string; date: string; kind: CoverKind; mime: string }): Promise<string>;
}

export class DbCoverStorage implements CoverStorage {
  async save(buffer: Buffer, opts: { mime: string }): Promise<string> {
    return `data:${opts.mime};base64,${buffer.toString('base64')}`;
  }
}

export class BlobCoverStorage implements CoverStorage {
  async save(buffer: Buffer, opts: { paperSlug: string; date: string; kind: CoverKind; mime: string }): Promise<string> {
    const { put } = await import('@vercel/blob');
    const ext = opts.mime === 'image/webp' ? 'webp' : opts.mime === 'image/png' ? 'png' : 'jpg';
    const blob = new Blob([new Uint8Array(buffer)], { type: opts.mime });
    const { url } = await put(`newspapers/${opts.paperSlug}/${opts.date}/${opts.kind}.${ext}`, blob, {
      access: 'public',
      contentType: opts.mime,
    });
    return url;
  }
}

export function getCoverStorage(): CoverStorage {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new BlobCoverStorage();
  return new DbCoverStorage();
}
