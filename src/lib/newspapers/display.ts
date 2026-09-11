// قانون نمایش پیشخوان: فقط جلد معتبر و قابل نمایش وارد Grid می‌شود.
// روزنامه بدون Cover هیچ Slot اشغال نمی‌کند (نه placeholder، نه visibility:hidden).
// ترتیب ورودی (priority/displayOrder) حفظ می‌شود؛ فقط آیتم‌های نامعتبر حذف می‌شوند.

export interface DisplayableCover {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

// جلد معتبر = آدرس تصویری واقعی (data:image یا http/https). لوگو/placeholder جدا فیلتر می‌شوند
// چون Backend هنگام Fetch فقط تصویر واقعی با Content-Type و ابعاد معتبر را ذخیره می‌کند.
export function hasDisplayableCover<T extends { today?: DisplayableCover | null }>(paper: T): boolean {
  const url = paper.today?.thumbnailUrl || paper.today?.imageUrl;
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (u.length < 32) return false;
  return u.startsWith('data:image/') || /^https?:\/\//i.test(u);
}

export function filterDisplayable<T extends { today?: DisplayableCover | null }>(papers: T[]): T[] {
  return (papers || []).filter(hasDisplayableCover);
}
