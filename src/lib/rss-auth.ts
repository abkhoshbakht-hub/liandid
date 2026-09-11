import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// چه کسی می‌خواهد Fetch را اجرا کند: ادمین لاگین‌شده، کرون با secret، یا هیچ‌کدام
export type RefreshActor = 'admin' | 'cron' | 'none';

function bearerSecret(req: Request): string {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  if (m) return m[1].trim();
  try {
    return (new URL(req.url).searchParams.get('secret') || '').trim();
  } catch {
    return '';
  }
}

function isVercelCron(req: Request): boolean {
  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  return ua.includes('vercel-cron');
}

export async function checkRefreshAuth(req: Request): Promise<RefreshActor> {
  try {
    const session = await getServerSession(authOptions);
    if (session && (session.user as any)?.role === 'ADMIN') return 'admin';
  } catch {}
  const configured = (process.env.CRON_SECRET || '').trim();
  const provided = bearerSecret(req);
  if (configured && provided && provided === configured) return 'cron';
  // سازگاری موقت تا وقتی CRON_SECRET در Vercel ست شود: فقط خود کرون ورسل
  if (!configured && isVercelCron(req)) {
    console.warn('[rss-auth] CRON_SECRET تنظیم نشده؛ اجرای کرون فقط با User-Agent پذیرفته شد');
    return 'cron';
  }
  return 'none';
}
