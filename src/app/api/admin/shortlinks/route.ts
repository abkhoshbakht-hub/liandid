import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

const PREFIX = 'short:';
const CODE_RE = /^[A-Za-z0-9_-]{3,20}$/;
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return code;
}

function isValidUrl(url: string): boolean {
  return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

// لیست لینک‌های کوتاه + جستجوی معکوس با url
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const findUrl = searchParams.get('url');

    const rows = await prisma.siteSetting.findMany({
      where: { key: { startsWith: PREFIX } },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    const items = rows.map(r => {
      let url = '';
      let clicks = 0;
      try {
        const data = JSON.parse(r.value);
        url = data?.url || '';
        clicks = data?.clicks || 0;
      } catch {}
      return { code: r.key.slice(PREFIX.length), url, clicks, updatedAt: r.updatedAt };
    });

    if (findUrl) {
      const found = items.find(i => i.url === findUrl);
      return NextResponse.json({ success: true, data: found || null });
    }

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}

// ساخت لینک کوتاه
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const url = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ success: false, message: 'لینک معتبر نیست' }, { status: 400 });
    }

    // اگر قبلاً برای همین لینک کد ساخته شده، همان را برگردان
    const existing = await prisma.siteSetting.findMany({ where: { key: { startsWith: PREFIX } } });
    for (const row of existing) {
      try {
        if (JSON.parse(row.value)?.url === url) {
          return NextResponse.json({ success: true, data: { code: row.key.slice(PREFIX.length) } });
        }
      } catch {}
    }

    let custom = typeof body?.code === 'string' ? body.code.trim() : '';
    if (custom) {
      if (!CODE_RE.test(custom)) {
        return NextResponse.json({ success: false, message: 'کد باید ۳ تا ۲۰ حرف انگلیسی، عدد، خط تیره یا آندرلاین باشد' }, { status: 400 });
      }
      const taken = await prisma.siteSetting.findUnique({ where: { key: PREFIX + custom } });
      if (taken) {
        return NextResponse.json({ success: false, message: 'این کد قبلاً استفاده شده است' }, { status: 400 });
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const candidate = randomCode(6);
        const taken = await prisma.siteSetting.findUnique({ where: { key: PREFIX + candidate } });
        if (!taken) {
          custom = candidate;
          break;
        }
      }
      if (!custom) {
        return NextResponse.json({ success: false, message: 'خطا در ساخت کد، دوباره تلاش کنید' }, { status: 500 });
      }
    }

    await prisma.siteSetting.create({
      data: { key: PREFIX + custom, value: JSON.stringify({ url, clicks: 0 }) },
    });

    return NextResponse.json({ success: true, data: { code: custom } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}

// حذف لینک کوتاه
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    if (!CODE_RE.test(code)) {
      return NextResponse.json({ success: false, message: 'کد معتبر نیست' }, { status: 400 });
    }

    await prisma.siteSetting.delete({ where: { key: PREFIX + code } }).catch(() => null);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
