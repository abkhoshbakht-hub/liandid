const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://liandid.ir';

interface SocialPostResult {
  platform: string;
  success: boolean;
  error?: string;
}

function formatMessage(title: string, category: string | null, excerpt: string | null, slug: string): string {
  const parts: string[] = [];
  if (category) parts.push(`📂 ${category}`);
  parts.push(`📰 ${title}`);
  if (excerpt) parts.push(`\n${excerpt.slice(0, 200)}${excerpt.length > 200 ? '...' : ''}`);
  parts.push(`\n🔗 ${SITE_URL}/news/${slug}`);
  return parts.join('\n');
}

export async function postToBale(
  title: string,
  category: string | null,
  excerpt: string | null,
  slug: string
): Promise<SocialPostResult> {
  const token = process.env.BALE_BOT_TOKEN;
  const chatId = process.env.BALE_CHANNEL_ID;

  if (!token || !chatId) {
    return { platform: 'بله', success: false, error: 'تنظیمات بله وارد نشده' };
  }

  try {
    const text = formatMessage(title, category, excerpt, slug);
    const res = await fetch(`https://api.bale.ai/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { platform: 'بله', success: false, error: data.description || 'خطا در ارسال' };
    }
    return { platform: 'بله', success: true };
  } catch (err) {
    return { platform: 'بله', success: false, error: String(err) };
  }
}

export async function postToRubika(
  title: string,
  category: string | null,
  excerpt: string | null,
  slug: string
): Promise<SocialPostResult> {
  const token = process.env.RUBIKA_BOT_TOKEN;
  const chatId = process.env.RUBIKA_CHANNEL_ID;

  if (!token || !chatId) {
    return { platform: 'روبیکا', success: false, error: 'تنظیمات روبیکا وارد نشده' };
  }

  try {
    const text = formatMessage(title, category, excerpt, slug);
    const res = await fetch('https://api.rubika.ir/v2/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Name': 'liandid',
        'X-App-Version': '1.0.0',
      },
      body: JSON.stringify({
        auth: token,
        to: chatId,
        msg_type: 'text',
        text,
      }),
    });
    const data = await res.json();
    if (data.status !== 'OK') {
      return { platform: 'روبیکا', success: false, error: data.message || 'خطا در ارسال' };
    }
    return { platform: 'روبیکا', success: true };
  } catch (err) {
    return { platform: 'روبیکا', success: false, error: String(err) };
  }
}

export async function postToAllSocials(
  title: string,
  category: string | null,
  excerpt: string | null,
  slug: string
): Promise<SocialPostResult[]> {
  const results = await Promise.allSettled([
    postToBale(title, category, excerpt, slug),
    postToRubika(title, category, excerpt, slug),
  ]);
  return results.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : { platform: 'نامشخص', success: false, error: String(r.reason) }
  );
}
