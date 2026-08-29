'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HelpItem {
  id: string;
  title: string;
  icon: string;
  content: string;
}

interface HelpSection {
  title: string;
  icon: string;
  items: HelpItem[];
}

const helpData: HelpSection[] = [
  {
    title: 'ورود به داشبورد',
    icon: '🔐',
    items: [
      { id: 'login', title: 'ورود', icon: '🔑', content: 'آدرس سایت/secure-a2x-admin را در مرورگر وارد کنید. ایمیل و رمز عبور خود را تایپ کنید و روی "ورود" کلیک کنید.' },
      { id: 'logout', title: 'خروج', icon: '🚪', content: 'از نوار بالای سایدبار داشبورد، دکمه "خروج" را بزنید تا از حساب کاربری خارج شوید.' },
    ]
  },
  {
    title: 'تنظیمات هدر',
    icon: '⚙️',
    items: [
      { id: 'logo', title: 'لوگو', icon: '🎨', content: 'از سایدبار > تنظیمات هدر > لوگو. تصویر لوگوی سایت را آپلود کنید. فرمت PNG با پس‌زمینه شفاف توصیه می‌شود. حداقل عرض: ۲۴۰ پیکسل.' },
      { id: 'license', title: 'پروانه انتشار', icon: '📋', content: 'شماره پروانه انتشار مطبوعاتی خود را در این بخش وارد کنید. این شماره در نوار بالای سایت نمایش داده می‌شود.' },
      { id: 'about', title: 'درباره ما', icon: 'ℹ️', content: 'متن و لینک صفحه "درباره ما" را تنظیم کنید. این متن در نوار بالای سایت و صفحه درباره ما نمایش داده می‌شود.' },
      { id: 'contact', title: 'تماس با ما', icon: '📞', content: 'اطلاعات تماس شامل آدرس، تلفن، ایمیل و فکس را وارد کنید. این اطلاعات در فوتر سایت نمایش داده می‌شود.' },
      { id: 'search', title: 'جستجو', icon: '🔍', content: 'متن پیش‌فرض باکس جستجو در هدر سایت را تنظیم کنید. مثلاً: "جستجو در اخبار..."' },
      { id: 'nav', title: 'منوی ناوبری', icon: '📑', content: 'آیتم‌های منوی اصلی سایت را اضافه، ویرایش یا حذف کنید. هر آیتم نام و لینک دارد. ترتیب نمایش از بالا به پایین است.' },
      { id: 'social', title: 'شبکه‌های اجتماعی', icon: '📱', content: 'لینک‌های شبکه‌های اجتماعی (تلگرام، اینستاگرام، بله) را وارد کنید. این لینک‌ها در هدر و فوتر سایت نمایش داده می‌شوند.' },
    ]
  },
  {
    title: 'مدیریت صفحه اصلی',
    icon: '🏠',
    items: [
      { id: 'hero', title: 'هیرو (بنر اصلی)', icon: '🖼️', content: 'هر باکس هیرو را با دکمه "ویرایش" مدیریت کنید. دو گزینه دارید: ۱) "انتخاب از آرشیو اخبار" برای انتخاب خبر موجود ۲) "نوشتن خبر اختصاصی" برای نوشتن محتوای دستی. خبر اختصاصی خودکار آرشیو می‌شود.' },
      { id: 'latest', title: 'آخرین اخبار', icon: '📰', content: 'خبرهایی که در بخش آخرین اخبار صفحه اصلی نمایش داده می‌شوند را مدیریت کنید. با کلیک روی "انتخاب خبر"، یکی از اخبار آرشیو را انتخاب کنید.' },
      { id: 'analysis', title: 'تحلیل خبر', icon: '📊', content: 'خبر تحلیلی ویژه صفحه اصلی را انتخاب کنید. این خبر با طرح خاصی در صفحه اصلی نمایش داده می‌شود.' },
      { id: 'events', title: 'مناسبت‌های تقویمی', icon: '📅', content: 'رویدادهای تقویمی را اضافه کنید. تاریخ شمسی و عنوان رویداد را وارد کنید. این رویدادها در تایمر شمارش معکوس صفحه اصلی نمایش داده می‌شوند.' },
      { id: 'external-news', title: 'اخبار لحظه‌ای', icon: '⚡', content: 'اخبار فوری از خبرگزاری‌ها را اضافه کنید. نام منبع و لینک خبر را وارد کنید. این اخبار در نوار چرخان بالای صفحه اصلی نمایش داده می‌شوند.' },
    ]
  },
  {
    title: 'مدیریت اخبار',
    icon: '📰',
    items: [
      { id: 'create-news', title: 'ایجاد خبر جدید', icon: '✏️', content: '۱) از سایدبار > اخبار > اخبار سایت بروید ۲) دکمه "خبر جدید" را بزنید ۳) عنوان، محتوا، دسته‌بندی و تصویر شاخص را پر کنید ۴) وضعیت را روی "منتشر شده" بگذارید ۵) "ذخیره" را بزنید.' },
      { id: 'edit-news', title: 'ویرایش خبر', icon: '🔧', content: 'از لیست اخبار، خبر مورد نظر را پیدا کنید. روی دکمه "ویرایش" کنار آن کلیک کنید. فیلدها را تغییر دهید و "ذخیره" را بزنید.' },
      { id: 'delete-news', title: 'حذف خبر', icon: '🗑️', content: 'از لیست اخبار، روی دکمه "حذف" کنار خبر مورد نظر کلیک کنید. در پنجره تایید، "بله" را بزنید. توجه: این عمل غیرقابل بازگشت است.' },
      { id: 'news-status', title: 'وضعیت اخبار', icon: '🏷️', content: 'چهار وضعیت وجود دارد: پیش‌نویس (منتشر نشده)، در انتظار تایید، منتشر شده (نمایش در سایت)، آرشیو شده (مخفی از سایت). هر خبر باید وضعیت "منتشر شده" داشته باشد تا در سایت نمایش داده شود.' },
      { id: 'news-categories', title: 'دسته‌بندی اخبار', icon: '📂', content: 'هر خبر باید یک دسته‌بندی داشته باشد. دسته‌بندی‌ها: سیاسی، اقتصادی، اجتماعی، بین‌الملل، فناوری، ورزشی، فرهنگی، علمی. هر دسته تب جداگانه‌ای در سایت دارد.' },
      { id: 'news-tags', title: 'برچسب اخبار', icon: '🔖', content: 'برچسب‌ها کلمات کلیدی مرتبط با خبر هستند. هنگام نوشتن خبر، برچسب‌های مرتبط را اضافه کنید. برچسب‌ها به مخاطبان کمک می‌کنند اخبار مشابه را پیدا کنند.' },
      { id: 'featured-image', title: 'تصویر شاخص', icon: '📷', content: 'تصویر شاخص تصویر اصلی خبر است که در لیست اخبار و صفحه خبر نمایش داده می‌شود. روی "انتخاب فایل" کلیک و تصویر را آپلود کنید. ابعاد پیشنهادی: ۱۲۰۰×۶۳۰ پیکسل.' },
      { id: 'seo', title: 'تنظیمات سئو', icon: '🌐', content: 'عنوان متا: عنوانی که در نتایج گوگل نمایش داده می‌شود (حداکثر ۶۰ کاراکتر). توضیحات متا: خلاصه خبر در نتایج گوگل (حداکثر ۱۶۰ کاراکتر). کلمات کلیدی: کلمات مرتبط برای موتورهای جستجو.' },
    ]
  },
  {
    title: 'اخبار لحظه‌ای و اختصاصی',
    icon: '⚡',
    items: [
      { id: 'instant-news', title: 'اخبار لحظه‌ای', icon: '🔴', content: 'از سایدبار > صفحه اصلی > اخبار لحظه‌ای. دکمه "خبر جدید" را بزنید. نام منبع (مثلاً: ایرنا، تسنیم) و لینک خبر را وارد کنید. این اخبار در نوار چرخان بالای سایت نمایش داده می‌شوند.' },
      { id: 'custom-news', title: 'خبر اختصاصی', icon: '✍️', content: 'از مدیریت صفحه اصلی > هیرو > ویرایش هر باکس > تب "نوشتن خبر اختصاصی". عنوان، متن خلاصه، لینک تصویر و لینک خبر را وارد کنید. ذخیره کنید. این خبر خودکار در آرشیو اخبار هم ذخیره می‌شود.' },
      { id: 'archive-custom', title: 'آرشیو اخبار اختصاصی', icon: '📚', content: 'هر خبر اختصاصی که ذخیره می‌کنید، خودکار در دسته "اخبار اختصاصی لیان دید" آرشیو می‌شود. برای مشاهده آرشیو: اخبار > اخبار سایت > فیلتر دسته "اخبار اختصاصی لیان دید".' },
      { id: 'submissions', title: 'ارسالی مخاطبین', icon: '📬', content: 'اخباری که بازدیدکنندگان سایت ارسال می‌کنند در این بخش نمایش داده می‌شود. می‌توانید آن‌ها را تایید، ویرایش یا حذف کنید. اخبار تایید شده در سایت منتشر می‌شوند.' },
    ]
  },
  {
    title: 'صفحات ایستا',
    icon: '📄',
    items: [
      { id: 'static-pages', title: 'ویرایش صفحات', icon: '📝', content: 'صفحات ثابت مانند درباره ما، تماس با ما، حریم خصوصی و قوانین. از سایدبار > صفحات ایستا > ویرایش صفحات. روی صفحه مورد نظر کلیک و متن را ویرایش کنید. متن ساده وارد کنید، خودکار تبدیل به HTML می‌شود.' },
      { id: 'manager-message', title: 'پیام مدیر مسئول', icon: '👨‍💼', content: 'از صفحات ایستا > پیام مدیر مسئول. متن پیام، تصویر مدیر و سایر اطلاعات را ویرایش کنید. این پیام در صفحه /about/launch نمایش داده می‌شود.' },
    ]
  },
  {
    title: 'مدیریت سایت',
    icon: '🛠️',
    items: [
      { id: 'categories', title: 'دسته‌بندی‌ها', icon: '📂', content: 'دسته‌بندی‌های خبری را مدیریت کنید. نام، نام انگلیسی (slug)، آیکون، رنگ و ترتیب نمایش هر دسته را تنظیم کنید. تعداد اخبار هر دسته نمایش داده می‌شود.' },
      { id: 'regions', title: 'شهرها و مناطق', icon: '📍', content: 'شهرها و مناطق استان بوشهر را مدیریت کنید. هر خبر می‌تواند به یک منطقه اختصاص داشته باشد. این مناطق در فیلتر اخبار استفاده می‌شوند.' },
      { id: 'comments', title: 'نظرات', icon: '💬', content: 'نظرات کاربران را مدیریت کنید. هر نظر باید تایید شود تا در سایت نمایش داده شود. می‌توانید نظرات را تایید، حذف یا پاسخ دهید.' },
      { id: 'newsletter', title: 'خبرنامه', icon: '📧', content: 'ایمیل‌های مشترکین خبرنامه را مشاهده و مدیریت کنید. می‌توانید مشترکین را حذف کنید.' },
      { id: 'users', title: 'کاربران', icon: '👥', content: 'کاربران داشبورد (مدیر و نویسنده) را مدیریت کنید. کاربر جدید اضافه یا نقش و دسترسی‌های کاربران را تغییر دهید. هر کاربر می‌تواند نقش "مدیر ارشد" یا "نویسنده" داشته باشد.' },
      { id: 'media', title: 'رسانه (آپلود فایل)', icon: '🖼️', content: 'فایل‌های تصویری و رسانه‌ای آپلود شده را مدیریت کنید. می‌توانید فایل‌ها را مشاهده، کپی لینک یا حذف کنید.' },
    ]
  },
  {
    title: 'فوتر و خاموشی',
    icon: '🔚',
    items: [
      { id: 'footer', title: 'تنظیمات فوتر', icon: '📎', content: 'محتوا و لینک‌های فوتر (پایین صفحه) سایت را مدیریت کنید. لینک‌های مفید، اطلاعات تماس و شبکه‌های اجتماعی در اینجا تنظیم می‌شوند.' },
      { id: 'shutdown', title: 'خاموش کردن سیستم', icon: '⏻', content: 'از نوار بالای داشبورد، دکمه "خاموش کردن" را بزنید. اگر می‌خواهید بکاپ بگیرید، تایید کنید و مسیر ذخیره‌سازی را مشخص کنید. سپس سیستم خاموش می‌شود.' },
      { id: 'backup', title: 'بکاپ‌گیری', icon: '💾', content: 'قبل از هر تغییر بزرگ، حتماً بکاپ بگیرید. از صفحه خاموش کردن سیستم می‌توانید بکاپ بگیرید. همچنین فایل‌های پشتیبان به صورت خودکار در پوشه backup_* ذخیره می‌شوند.' },
    ]
  },
];

export default function HelpPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">بازگشت</Link>
            <h1 className="text-xl font-bold">راهنمای مدیریت سایت</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
          <h2 className="text-lg font-bold text-[#1B365D]">روی هر بخش کلیک کنید تا آموزش آن نمایش داده شود</h2>
          <p className="text-sm text-gray-400 mt-1">هر منو و تب داشبورد توضیح داده شده</p>
        </div>

        <div className="space-y-3">
          {helpData.map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-bold text-[#1B365D]">{section.title}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{section.items.length} مورد</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSection === section.title ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSection === section.title && (
                <div className="border-t border-gray-100">
                  {section.items.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#C9A96E]/5 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="text-sm font-medium text-gray-700">{item.title}</span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-300 transition-transform ${openItem === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openItem === item.id && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                          <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>تهیه کننده: لیان دیزاین | تلفن تماس: 09938866331</p>
        </div>
      </div>
    </div>
  );
}
