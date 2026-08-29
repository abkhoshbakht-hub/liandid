import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قوانین استفاده',
  description: 'قوانین و مقررات استفاده از پایگاه خبری لیان دید',
  openGraph: { title: 'قوانین استفاده | لیان دید', description: 'قوانین و مقررات استفاده از پایگاه خبری لیان دید', type: 'website', url: 'https://liandid.ir/terms', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'قوانین استفاده | لیان دید', description: 'قوانین و مقررات استفاده از پایگاه خبری لیان دید' },
  alternates: { canonical: 'https://liandid.ir/terms' },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#C9A96E] rounded-full" />
              <h1 className="text-2xl font-black text-[#1B365D]">قوانین استفاده</h1>
            </div>

            <div className="space-y-6 text-gray-700 leading-8 text-sm text-justify">
              <p>آخرین به‌روزرسانی: تیرماه ۱۴۰۵</p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">شرایط استفاده</h2>
              <p>
                با استفاده از پایگاه خبری لیان دید، شما شرایط و قوانین زیر را می‌پذیرید. لطفاً این قوانین را با دقت مطالعه کنید.
              </p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">حقوق محتوا</h2>
              <p>
                تمام محتوای منتشر شده در این پایگاه خبری شامل اخبار، تصاویر، ویدیوها و مقالات تحت حمایت قوانین حق تکثیر جمهوری اسلامی ایران است.
              </p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">مسئولیت کاربران</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>استفاده صحیح و قانونی از محتوای سایت</li>
                <li>عدم کپی‌برداری غیرمجاز از مطالب</li>
                <li>ارسال نظرات سازنده و محترمانه</li>
                <li>عدم انتشار محتوای خلاف قوانین</li>
              </ul>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">نحوه استفاده از مطالب</h2>
              <p>
                بازنشر اخبار لیان دید با ذکر منبع و لینک فعال بلامانع است. استفاده تجاری از محتوا بدون اجازه کتبی ممنوع است.
              </p>

              <h2 className="text-lg font-bold text-[#1B365D] mt-6">تغییرات قوانین</h2>
              <p>
                لیان دید حق تغییر این قوانین را در هر زمان برای خود محفوظ می‌دارد. تغییرات از لحظه انتشار لازم‌الاجرا هستند.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
