import nodemailer from 'nodemailer';
import { env } from '../config.ts';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

function toHtml(body: string): string {
  const esc = body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.9;color:#1f2937;max-width:720px">
<div style="border-top:5px solid #00686F;border-bottom:2px solid #B08D44;padding:10px 0;margin-bottom:16px;color:#00686F;font-weight:bold">جامعة أم القرى — كلية الحاسبات — وكالة الكلية للتطوير والجودة</div>
<div style="white-space:pre-wrap">${esc}</div></div>`;
}

export async function sendEmail(to: string, subject: string, body: string, cc?: string[]): Promise<string> {
  const info = await getTransporter().sendMail({
    from: `"${env.smtp.fromName}" <${env.smtp.from}>`,
    to,
    cc: cc && cc.length ? cc : undefined,
    subject,
    text: body,
    html: toHtml(body),
  });
  return info.messageId;
}

export async function verifyEmail(): Promise<void> {
  await getTransporter().verify();
}
