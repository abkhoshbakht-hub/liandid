import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست حفظ حریم خصوصی پایگاه خبری لیان دید',
  openGraph: { title: 'حریم خصوصی | لیان دید', description: 'سیاست حفظ حریم خصوصی پایگاه خبری لیان دید', type: 'website', url: 'https://liandid.ir/privacy', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'حریم خصوصی | لیان دید', description: 'سیاست حفظ حریم خصوصی پایگاه خبری لیان دید' },
  alternates: { canonical: 'https://liandid.ir/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#C9A96E] rounded-full" />
              <h1 className="text-2xl font-black text-[#1B365D]">حریم خصوصی</h1>
            </div>

            <div className="space-y-6 text-gray-700 leading-8 text-sm text-justify">
              <p>آخرین به‌روزرسانی: تیرماه ۱۴۰۵</p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">جمع‌آوری اطلاعات</h2>
              <p>
                پایگاه خبری لیان دید به حریم خصوصی کاربران خود احترام می‌گذارد. ما اطلاعات شخصی شما را فقط در موارد ضروری جمع‌آوری می‌کنیم.
              </p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">کوکی‌ها</h2>
              <p>
                این وب‌سایت ممکن است از کوکی‌ها برای بهبود تجربه کاربری استفاده کند. کوکی‌ها فایل‌های کوچکی هستند که در مرورگر شما ذخیره می‌شوند.
              </p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">استفاده از اطلاعات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>ارسال خبرنامه و اطلاع‌رسانی</li>
                <li>بهبود محتوا و خدمات سایت</li>
                <li>پاسخ به پیام‌ها و سوالات شما</li>
              </ul>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">امنیت اطلاعات</h2>
              <p>
                ما از تکنیک‌های امنیتی مناسب برای محافظت از اطلاعات شما استفاده می‌کنیم و هیچ اطلاعاتی را بدون اجازه شما در اختیار اشخاص ثالث قرار نمی‌دهیم.
              </p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">تماس با ما</h2>
              <p>
                برای سوالات مربوط به حریم خصوصی با ما از طریق ایمیل privacy@liandid.ir در تماس باشید.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
