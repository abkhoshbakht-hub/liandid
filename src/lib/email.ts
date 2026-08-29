import { prisma } from './prisma';

function isSmtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function getTransporter() {
  const nodemailer = (await import('nodemailer')).default;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendNewsletterToAll(title: string, html: string) {
  if (!isSmtpConfigured()) {
    return { sent: 0, failed: 0, total: 0, skipped: true };
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  if (subscribers.length === 0) return { sent: 0, failed: 0, total: 0 };

  const transporter = await getTransporter();
  const emails = subscribers.map(s => s.email);
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: `"لیان دید" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: title,
        html: `
          <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;">
            <div style="background:#1B365D;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
              <h1 style="color:#C9A96E;margin:0;">لیان دید</h1>
              <p style="color:#fff;margin:5px 0 0;font-size:12px;">خبرنامه استان بوشهر</p>
            </div>
            <div style="background:#fff;padding:20px;border-radius:0 0 10px 10px;border:1px solid #eee;">
              ${html}
            </div>
            <div style="text-align:center;padding:10px;color:#999;font-size:11px;">برای لغو عضویت ایمیل خود را پاسخ دهید</div>
          </div>
        `,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed, total: emails.length };
}

export async function sendWelcomeEmail(email: string) {
  if (!isSmtpConfigured()) return;

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"لیان دید" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'عضویت شما در خبرنامه لیان دید تأیید شد',
      html: `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#1B365D;">عضویت موفق!</h2>
          <p>شما با موفقیت در خبرنامه لیان دید عضو شدید.</p>
          <p>از این پس آخرین اخبار استان بوشهر را در ایمیل خود دریافت خواهید کرد.</p>
        </div>
      `,
    });
  } catch {}
}
