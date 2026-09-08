import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// لینک کوتاه: liandid.ir/s/xxxxxx → آدرس اصلی خبر
export default async function ShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!/^[A-Za-z0-9_-]{3,20}$/.test(code)) notFound();

  const row = await prisma.siteSetting.findUnique({ where: { key: `short:${code}` } });
  if (!row) notFound();

  let url: string | null = null;
  let clicks = 0;
  try {
    const data = JSON.parse(row.value);
    url = typeof data?.url === 'string' ? data.url : null;
    clicks = typeof data?.clicks === 'number' ? data.clicks : 0;
  } catch {}

  if (!url || (!url.startsWith('/') && !url.startsWith('http'))) notFound();

  try {
    await prisma.siteSetting.update({
      where: { key: row.key },
      data: { value: JSON.stringify({ url, clicks: clicks + 1 }) },
    });
  } catch {}

  // هدر Location فقط ASCII قبول می‌کند؛ مسیر فارسی باید انکد شود
  let target = url;
  if (url.startsWith('/')) {
    try {
      target = encodeURI(decodeURI(url));
    } catch {
      target = encodeURI(url);
    }
  }
  redirect(target);
}
