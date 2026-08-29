# راهنمای استقرار لیان دید روی VPS ایرانی

راهنمای قدم‌به‌قدم برای انتقال سایت به اینترنت. این راهنما برای **VPS اوبونتو ۲۲.۰۴** با پرداخت ریالی نوشته شده.

---

## فاز ۱: خرید VPS

### گزینه‌های پیشنهادی (پرداخت ریالی)
| شرکت | سایت | حداقل رم | قیمت حدودی |
|------|------|---------|------------|
| پارس‌پک | pars-pak.com | ۲ گیگابایت | ~۸۰-۱۲۰ هزار تومان/ماه |
| ایران‌سرور | iranserver.com | ۲ گیگابایت | ~۱۰۰-۱۵۰ هزار تومان/ماه |
| سینا هاستینگ | sinahosting.net | ۲ گیگابایت | ~۹۰-۱۳۰ هزار تومان/ماه |
| افق سرور | ofogheserver.com | ۲ گیگابایت | ~۱۰۰ هزار تومان/ماه |

### مشخصات پیشنهادی VPS:
- **سیستم‌عامل:** اوبونتو ۲۲.۰۴ LTS (اجباری)
- **رم:** حداقل ۲ گیگابایت (برای Node.js + Next.js لازم)
- **فضا:** حداقل ۲۰ گیگابایت
- **پنل:** بدون کنترل پنل (خالی) — با SSH کار می‌کنیم

> بعد از خرید، **آی‌پی سرور** و **رمز ریشه (root)** به دستت می‌رسه.

---

## فاز ۲: اتصال به سرور (SSH)

### ویندوز (پاورشل):
```powershell
ssh root@آی‌پی-سرور
```
رمز root رو وارد کن.

> **اگر SSH وصل نشد:** به پنل هاست نگاه کن، شاید باید اول SSH رو از فایروال باز کنی.

---

## فاز ۳: انتقال فایل‌ها به سرور

### روش A — فایل ZIP (ساده‌تر):

**۱.** روی ویندوز، از پروژه بکاپ ZIP بگیر:
```powershell
Compress-Archive -Path "D:\lian-did\*" -DestinationPath "D:\lian-did-deploy.zip" -Force
```
> ⚠️ قبلش `.next` و `node_modules` رو حذف کن یا مستثنی کن (حجمشون زیاده).

**۲.** روی ویندوز، فایل رو به سرور بفرست (پاورشل):
```powershell
scp D:\lian-did-deploy.zip root@آی‌پی-سرور:/root/
```

**۳.** روی سرور (SSH)، از حالت فشرده خارج کن:
```bash
cd /root
mkdir -p /var/www/liandid
unzip lian-did-deploy.zip -d /var/www/liandid
cd /var/www/liandid
```

### روش B — Git (حرفه‌ای‌تر):
اگر پروژه رو روی GitHub بذاری:
```bash
cd /var/www
git clone https://github.com/نام‌کاربری/لینک-رپو liandid
cd liandid
```

---

## فاز ۴: نصب پیش‌نیازها و راه‌اندازی

روی سرور، فایل `setup.sh` رو اجرا کن:
```bash
cd /var/www/liandid
bash setup.sh
```

این اسکریپت خودش نصب می‌کنه:
- ✅ Node.js 20
- ✅ PM2 (مدیریت فرآیند)
- ✅ Nginx (وب‌سرور)
- ✅ وابستگی‌های پروژه
- ✅ دیتابیس (Prisma)
- ✅ نسخه تولید (Build)
- ✅ اجرای خودکار سایت

---

## فاز ۵: تنظیم فایل محیطی (دیتابیس)

بعد از انتقال، فایل `.env.production` رو به اسم `.env` تغییر بده و **دامنه واقعی** رو بذار:
```bash
cd /var/www/liandid
cp .env.production .env
nano .env
```

مقادیر مهم:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://دامنه-تو.ir"
NEXT_PUBLIC_SITE_URL="https://دامنه-تو.ir"
NEXTAUTH_SECRET="یک-رشته-طولانی-تصادفی"
```

> ⚠️ `NEXTAUTH_SECRET` رو حتماً عوض کن به یه رشته تصادفی (در ویندوز با `openssl rand -base64 32` بساز).

بعد دوباره سرویس رو ری‌استارت کن:
```bash
pm2 restart lian-did
```

---

## فاز ۶: انتقال دیتابیس موجود (اختیاری)

اگه اخبار و کاربرهای فعلی رو می‌خوای، فایل دیتابیس رو انتقال بده:
```bash
# روی ویندوز:
scp D:\lian-did\prisma\dev.db root@آی‌پی-سرور:/var/www/liandid/prisma/
```

> همیشه قبل از انتقال، از دیتابیس سرور بکاپ بگیر.

---

## فاز ۷: تنظیم Nginx و دامنه

**۱.** فایل تنظیمات Nginx رو کپی کن:
```bash
cp /var/www/liandid/nginx-liandid.conf /etc/nginx/sites-available/liandid.ir
ln -s /etc/nginx/sites-available/liandid.ir /etc/nginx/sites-enabled/
```

**۲.** توی فایل، اسم دامنه رو عوض کن:
```bash
nano /etc/nginx/sites-available/liandid.ir
```
بجای `liandid.ir` دامنه خودت رو بذار (دو جا: `server_name` و `uploads`).

**۳.** نرم‌افزار Nginx رو تست و ری‌استارت کن:
```bash
nginx -t
systemctl reload nginx
```

---

## فاز ۸: تنظیم DNS دامنه

به پنل مدیریت دامنه خودت (سایت ایرانی که دامنه گرفتی) برو:

| نوع رکورد | نام | مقدار |
|-----------|-----|-------|
| A | @ | آی‌پی سرور VPS |
| A | www | آی‌پی سرور VPS |

> ⏳ انتشار DNS بین ۱ تا ۲۴ ساعت طول می‌کشه.

---

## فاز ۹: فعال‌سازی SSL (https)

وقتی DNS منتشر شد و سایت با http بالا اومد:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d دامنه-تو.ir -d www.دامنه-تو.ir
```

گواهی رایگان Let's Encrypt گرفتی. تمدید خودکار هم تنظیم میشه.

---

## فاز ۱۰: اطمینان از پایداری

### بعد از ری‌استارت سرور، خودکار بالا بیاد:
```bash
pm2 startup
pm2 save
```

### مشاهده لاگ‌ها:
```bash
pm2 logs lian-did
```

### وضعیت سرویس:
```bash
pm2 status
```

### بروزرسانی سایت در آینده:
```bash
cd /var/www/liandid
git pull            # یا دوباره فایل جدید بفرست
npm install
npx prisma generate
npm run build
pm2 restart lian-did
```

---

## 🔒 نکات امنیتی مهم

1. **رمز root** رو عوض کن و یه کاربر معمولی بساز
2. **فایروال UFW** رو فعال کن (فقط پورت ۸۰، ۴۴۳، ۲۲)
   ```bash
   ufw allow 22,80,443/tcp
   ufw enable
   ```
3. فایل `.env` نباید جایی آپلود بشه که عمومی باشه
4. روتین بکاپ هفتگی از دیتابیس:
   ```bash
   cp /var/www/liandid/prisma/dev.db /root/backups/dev-$(date +%F).db
   ```
5. همیشه `pm2 save` بزن تا بعد از ری‌استارت بالا بیاد

---

## 🛠️ رفع اشکال سریع

| مشکل | راه حل |
|------|--------|
| سایت بالا نمیاد | `pm2 status` ببین، `pm2 logs lian-did` خطاها رو بخون |
| خطای ۵۰۲ | Nginx به پورت ۳۰۰۰ نمیرسه. `pm2 status` رو چک کن |
| خطای پرتقالی (اینترنت نیست) | فایروال هاست یا پنل؛ پورت ۸۰ و ۴۴۳ رو باز کن |
| فونت/تصویر لود نمیشه | `public/` درست منتقل شده باشه |
| صفحه سفید | `npm run build` دوباره بزن |
| SSL نگرفت | مطمئن شو DNS منتشر شده (از سایت `dnschecker.org` چک کن) |

---

## 📋 چک‌لیست نهایی

- [ ] VPS اوبونتو ۲۲.۰۴ خریدن
- [ ] SSH وصل شدن
- [ ] پروژه انتقال داده شدن
- [ ] `setup.sh` اجرا شده
- [ ] `.env` با دامنه واقعی تنظیم شده
- [ ] Nginx تنظیم شده
- [ ] DNS دامنه به آی‌پی وصل شده
- [ ] SSL گرفتن
- [ ] سایت با `https://دامنه.ir` باز میشه
