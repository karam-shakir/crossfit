import 'dotenv/config';

const bool = (v: string | undefined, d = false) => (v === undefined || v === '' ? d : /^(1|true|yes)$/i.test(v));
const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);

export const env = {
  port: num(process.env.PORT, 4000),
  tz: process.env.TZ_NAME || 'Asia/Riyadh',
  dashboardPassword: process.env.DASHBOARD_PASSWORD || '', // متوافق مع الإصدار السابق: يُستخدم ككلمة مرور المدير الأولى إن لم تُحدد ADMIN_PASSWORD
  dryRun: bool(process.env.DRY_RUN, true),
  dataDir: process.env.DATA_DIR || new URL('../data/', import.meta.url).pathname,

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'وكالة الكلية للتطوير والجودة',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  },
  viceDeanEmail: process.env.VICE_DEAN_EMAIL || '',

  imap: {
    enabled: bool(process.env.IMAP_ENABLED, false),
    host: process.env.IMAP_HOST || '',
    port: num(process.env.IMAP_PORT, 993),
    secure: bool(process.env.IMAP_SECURE, true),
    user: process.env.IMAP_USER || process.env.SMTP_USER || '',
    pass: process.env.IMAP_PASS || process.env.SMTP_PASS || '',
    mailbox: process.env.IMAP_MAILBOX || 'INBOX',
    pollMinutes: num(process.env.IMAP_POLL_MINUTES, 15),
  },

  teamsWebhookUrl: process.env.TEAMS_WEBHOOK_URL || '',

  whatsapp: {
    provider: (process.env.WHATSAPP_PROVIDER || 'none') as 'none' | 'meta' | 'twilio',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || '',
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'ar',
    twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_WHATSAPP_FROM || '',
  },
};

export const channelConfigured = {
  email: () => Boolean(env.smtp.host && env.smtp.user && env.smtp.pass),
  teams: () => true, // يعتمد على وجود webhook لكل قسم
  whatsapp: () =>
    (env.whatsapp.provider === 'meta' && Boolean(env.whatsapp.phoneNumberId && env.whatsapp.accessToken)) ||
    (env.whatsapp.provider === 'twilio' && Boolean(env.whatsapp.twilioSid && env.whatsapp.twilioToken && env.whatsapp.twilioFrom)),
};
