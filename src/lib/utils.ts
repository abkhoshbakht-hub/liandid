export function toPersianDigits(str: string | number): string {
  const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(str).replace(/\d/g, d => persian[parseInt(d)]);
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'همین الان';
  if (mins < 60) return `${toPersianDigits(mins)} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${toPersianDigits(hrs)} ساعت پیش`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'دیروز';
  if (days < 7) return `${toPersianDigits(days)} روز پیش`;
  return d.toLocaleDateString('fa-IR');
}

export const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  'سیاسی':    { bg: 'bg-blue-600',    text: 'text-blue-600',    gradient: 'from-blue-600 to-blue-800' },
  'اقتصادی':  { bg: 'bg-emerald-600', text: 'text-emerald-600', gradient: 'from-emerald-600 to-emerald-800' },
  'اجتماعی':  { bg: 'bg-orange-500',  text: 'text-orange-500',  gradient: 'from-orange-500 to-orange-700' },
  'بین‌الملل':{ bg: 'bg-violet-600',  text: 'text-violet-600',  gradient: 'from-violet-600 to-violet-800' },
  'فناوری':   { bg: 'bg-cyan-600',    text: 'text-cyan-600',    gradient: 'from-cyan-600 to-cyan-800' },
  'ورزشی':    { bg: 'bg-green-600',   text: 'text-green-600',   gradient: 'from-green-600 to-green-800' },
  'فرهنگی':   { bg: 'bg-rose-500',    text: 'text-rose-500',    gradient: 'from-rose-500 to-rose-700' },
  'علمی':     { bg: 'bg-indigo-500',  text: 'text-indigo-500',  gradient: 'from-indigo-500 to-indigo-700' },
  'استانی':   { bg: 'bg-teal-600',    text: 'text-teal-600',    gradient: 'from-teal-600 to-teal-800' },
  'اختصاصی':  { bg: 'bg-amber-600',   text: 'text-amber-600',   gradient: 'from-amber-600 to-amber-800' },
};

export function getCategoryStyle(cat: string | null) {
  return categoryColors[cat || ''] || { bg: 'bg-slate-600', text: 'text-slate-600', gradient: 'from-slate-600 to-slate-800' };
}
