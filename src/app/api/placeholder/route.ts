import { NextRequest, NextResponse } from 'next/server';

const COLORS: Record<string, { bg1: string; bg2: string; accent: string }> = {
  'اقتصادی': { bg1: '#1B365D', bg2: '#2E5090', accent: '#C9A96E' },
  'سیاسی': { bg1: '#1a1a2e', bg2: '#16213e', accent: '#e94560' },
  'اجتماعی': { bg1: '#0f3460', bg2: '#1B365D', accent: '#53a8b6' },
  'ورزشی': { bg1: '#1B365D', bg2: '#0d2137', accent: '#4ecca3' },
  'فرهنگی': { bg1: '#2d132c', bg2: '#1B365D', accent: '#C9A96E' },
  'فناوری': { bg1: '#0c0032', bg2: '#190061', accent: '#3500d3' },
  'علمی': { bg1: '#1B365D', bg2: '#1a1a3e', accent: '#00d2ff' },
  'استانی': { bg1: '#1B365D', bg2: '#2E5090', accent: '#C9A96E' },
  'default': { bg1: '#1B365D', bg2: '#0d1b2a', accent: '#C9A96E' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'اقتصادی': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
  'سیاسی': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  'اجتماعی': 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  'ورزشی': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H15V4.07zM15 7h2.87c.48.48.86 1.03 1.13 1.63H15V7zm0 3.43h3.94c.2.6.33 1.24.38 1.9H15v-1.9zM15 13h4.32c.05.66.02 1.32-.08 1.97H15V13zm0 3.43h4.13c-.18.63-.46 1.22-.82 1.76H15v-1.76z',
  'فرهنگی': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'فناوری': 'M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
  'علمی': 'M7 2v11h3v9l7-12h-4l4-8z',
  'استانی': 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
};

function getCategoryKey(title: string, sourceName: string): string {
  if (/اقتصاد|بودجه|بازار|سهام|ارز|نفت|گاز|پتروشیمی|صادرات|واردات|تولید|صنعت/.test(title)) return 'اقتصادی';
  if (/سیاس|مجلس|دولت|وزیر|استاندار|فرماندار|انتخابات|شورا/.test(title)) return 'سیاسی';
  if (/اجتماع|فرهنگ|مردم|خدم|بهداشت|درمان|آموزش|مدرسه|دانشگاه/.test(title)) return 'اجتماعی';
  if (/ورزش|فوتبال|والیبال|بسکتبال|قهرمان|مسابقه|لیگ/.test(title)) return 'ورزشی';
  if (/فرهنگ|هنر|سینما|موسیقی|کتاب|موزه|تئاتر/.test(title)) return 'فرهنگی';
  if (/فناور|تکنولوژ|دیجیتال|نرم‌افزار|سایبر|هوش مصنوعی/.test(title)) return 'فناوری';
  if (/علمی|پژوهش|تحقیق|کشف|آزمایش/.test(title)) return 'علمی';
  if (/استان|شهر|روست|بندر|منطقه/.test(title)) return 'استانی';
  return 'default';
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, 3);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'خبر لیان دید';
  const category = searchParams.get('category') || '';
  const source = searchParams.get('source') || '';
  const width = parseInt(searchParams.get('w') || '800');
  const height = parseInt(searchParams.get('h') || '450');

  const cat = getCategoryKey(title, source);
  const colors = COLORS[cat] || COLORS['default'];
  const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS['default'];

  const lines = wrapText(title, Math.floor(width / 18));
  const textY = height / 2 - (lines.length * 14);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg1}"/>
      <stop offset="100%" style="stop-color:${colors.bg2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${colors.accent}" stroke-width="0.3" opacity="0.15"/>
    </pattern>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0"/>
      <stop offset="50%" style="stop-color:${colors.accent};stop-opacity:0.08"/>
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect width="${width}" height="${height * 0.15}" y="${height * 0.85}" fill="url(#shine)"/>
  <circle cx="${width - 60}" cy="60" r="120" fill="${colors.accent}" opacity="0.06"/>
  <circle cx="${width - 30}" cy="30" r="80" fill="${colors.accent}" opacity="0.04"/>
  <circle cx="80" cy="${height - 40}" r="100" fill="${colors.accent}" opacity="0.05"/>
  <line x1="40" y1="${height - 35}" x2="${width - 40}" y2="${height - 35}" stroke="${colors.accent}" stroke-width="2" opacity="0.3"/>
  <rect x="40" y="${height - 32}" width="60" height="4" rx="2" fill="${colors.accent}" opacity="0.5"/>
  <text x="${width / 2}" y="${textY}" text-anchor="middle" fill="white" font-family="Vazirmatn, Tahoma, Arial" font-size="22" font-weight="700" opacity="0.95">
    ${lines.map((line, i) => `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 30}">${escapeXml(line)}</tspan>`).join('\n    ')}
  </text>
  ${source ? `<text x="40" y="35" fill="${colors.accent}" font-family="Vazirmatn, Tahoma, Arial" font-size="13" font-weight="500" opacity="0.8">${escapeXml(source)}</text>` : ''}
  ${category ? `<rect x="40" y="45" width="${category.length * 10 + 20}" height="26" rx="13" fill="${colors.accent}" opacity="0.2"/><text x="${50 + category.length * 5}" y="62" text-anchor="middle" fill="${colors.accent}" font-family="Vazirmatn, Tahoma, Arial" font-size="12" font-weight="500">${escapeXml(category)}</text>` : ''}
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
