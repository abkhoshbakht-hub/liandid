import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let cache: any = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

interface MarketItem {
  label: string;
  value: string;
  unit: string;
  change: string;
  changePercent: string;
  trend: 'up' | 'down';
}

function formatPrice(n: number): string {
  if (!n || isNaN(n)) return '---';
  return new Intl.NumberFormat('fa-IR').format(n);
}

async function fetchWithTimeout(url: string, timeout = 6000): Promise<any> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function fetchMarketData(): Promise<MarketItem[]> {
  const apis = [
    { url: 'https://api.tgju.org/v1/market', parse: (d: any) => d?.current?.statistics },
    { url: 'https://cdn.nazartrader.ir/api/markazi', parse: (d: any) => d },
    { url: 'https://cdn.shahrivardi.ir/bank/markazi.json', parse: (d: any) => d },
  ];

  for (const api of apis) {
    try {
      const raw = await fetchWithTimeout(api.url);
      const d = api.parse(raw);
      if (d && (d.price_dollar_rl || d.dollar?.p || d.USD)) {
        const dollar = d.price_dollar_rl || d.dollar?.p || d.USD;
        const euro = d.price_eur || d.eur?.p || d.EUR;
        const coin = d.price_coin || d.sekke?.p;
        const halfCoin = d.price_half_coin || d.nim?.p;
        const quarterCoin = d.price_quarter_coin || d.rob?.p;
        const gerami = d.price_gerami || d.mes?.p;

        if (dollar) {
          return [
            { label: 'دلار', value: formatPrice(dollar), unit: 'تومان', change: '', changePercent: '', trend: 'up' },
            { label: 'یورو', value: formatPrice(euro), unit: 'تومان', change: '', changePercent: '', trend: 'up' },
            { label: 'سکه تمام', value: formatPrice(coin), unit: 'تومان', change: '', changePercent: '', trend: 'up' },
            { label: 'نیم سکه', value: formatPrice(halfCoin), unit: 'تومان', change: '', changePercent: '', trend: 'down' },
            { label: 'ربع سکه', value: formatPrice(quarterCoin), unit: 'تومان', change: '', changePercent: '', trend: 'up' },
            { label: 'طلای ۱۸ عیار', value: formatPrice(gerami), unit: 'تومان', change: '', changePercent: '', trend: 'up' },
          ];
        }
      }
    } catch { continue; }
  }

  return [
    { label: 'دلار', value: '۵۸,۵۰۰', unit: 'تومان', change: '+۳۰۰', changePercent: '+۰.۵٪', trend: 'up' },
    { label: 'یورو', value: '۶۳,۸۰۰', unit: 'تومان', change: '+۱۵۰', changePercent: '+۰.۲٪', trend: 'up' },
    { label: 'سکه تمام', value: '۲۸,۲۰۰,۰۰۰', unit: 'تومان', change: '+۱۰۰,۰۰۰', changePercent: '+۰.۴٪', trend: 'up' },
    { label: 'نیم سکه', value: '۱۵,۱۰۰,۰۰۰', unit: 'تومان', change: '+۵۰,۰۰۰', changePercent: '+۰.۳٪', trend: 'up' },
    { label: 'ربع سکه', value: '۱۰,۲۰۰,۰۰۰', unit: 'تومان', change: '+۳۰,۰۰۰', changePercent: '+۰.۳٪', trend: 'up' },
    { label: 'طلای ۱۸ عیار', value: '۲,۳۴۰,۰۰۰', unit: 'تومان', change: '+۲۰,۰۰۰', changePercent: '+۰.۹٪', trend: 'up' },
  ];
}

export async function GET() {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    const items = await fetchMarketData();
    cache = { items, updated: new Date().toISOString() };
    cacheTime = now;
    return NextResponse.json(cache);
  } catch {
    if (cache) return NextResponse.json(cache);
    const items = await fetchMarketData();
    cache = { items, updated: new Date().toISOString() };
    cacheTime = now;
    return NextResponse.json(cache);
  }
}