import { env } from '../config.ts';

export function normalizePhone(phone: string): string {
  let p = phone.replace(/[^\d+]/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('00')) p = p.slice(2);
  // أرقام سعودية محلية 05xxxxxxxx -> 9665xxxxxxxx
  if (/^05\d{8}$/.test(p)) p = '966' + p.slice(1);
  return p;
}

async function sendMeta(phone: string, text: string): Promise<string> {
  const url = `https://graph.facebook.com/v20.0/${env.whatsapp.phoneNumberId}/messages`;
  const payload = env.whatsapp.templateName
    ? {
        messaging_product: 'whatsapp', to: phone, type: 'template',
        template: {
          name: env.whatsapp.templateName,
          language: { code: env.whatsapp.templateLang },
          components: [{ type: 'body', parameters: [{ type: 'text', text: text.replace(/\n{2,}/g, '\n').slice(0, 1000) }] }],
        },
      }
    : { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: text } };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.whatsapp.accessToken}` },
    body: JSON.stringify(payload),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WhatsApp Cloud API HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json?.messages?.[0]?.id || 'ok';
}

async function sendTwilio(phone: string, text: string): Promise<string> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.whatsapp.twilioSid}/Messages.json`;
  const form = new URLSearchParams({ From: env.whatsapp.twilioFrom, To: `whatsapp:+${phone}`, Body: text });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${env.whatsapp.twilioSid}:${env.whatsapp.twilioToken}`).toString('base64'),
    },
    body: form,
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Twilio HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json?.sid || 'ok';
}

export async function sendWhatsApp(phone: string, subject: string, body: string): Promise<string> {
  const p = normalizePhone(phone);
  const text = `*${subject}*\n\n${body}`;
  if (env.whatsapp.provider === 'meta') return sendMeta(p, text);
  if (env.whatsapp.provider === 'twilio') return sendTwilio(p, text);
  throw new Error('WhatsApp provider غير مُعد');
}

/** رابط wa.me للإرسال اليدوي بضغطة واحدة */
export function whatsappLink(phone: string, subject: string, body: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(`*${subject}*\n\n${body}`)}`;
}
