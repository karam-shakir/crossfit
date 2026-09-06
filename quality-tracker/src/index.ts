/** تشغيل الخادم + المجدول التلقائي */
import cron from 'node-cron';
import { env } from './config.ts';
import { createApp, ensureDefaultAdmin } from './server.ts';
import { runTick } from './runner.ts';
import { checkInbox } from './inbox.ts';
import { loadConfig, loadState } from './store.ts';
import { hourInTz, todayInTz } from './dates.ts';

const app = createApp();

function tickedToday(): boolean {
  const s = loadState();
  return Boolean(s.lastTickAt && todayInTz(env.tz, new Date(s.lastTickAt)) === todayInTz(env.tz));
}

async function scheduledTick(reason: string) {
  const cfg = loadConfig();
  if (hourInTz(env.tz) < cfg.settings.sendHour || tickedToday()) return;
  try {
    const r = await runTick();
    console.log(`[${new Date().toISOString()}] دورة أتمتة (${reason}): ${r.planned} رسالة مخططة، ${r.logs.filter((l) => l.status === 'sent').length} مُرسلة، ${r.logs.filter((l) => l.status === 'failed').length} فشلت`);
  } catch (e: any) {
    console.error('خطأ في دورة الأتمتة:', e.message || e);
  }
}

async function scheduledInbox() {
  if (!env.imap.enabled) return;
  try {
    const r = await checkInbox();
    if (r.matched) {
      console.log(`[${new Date().toISOString()}] صندوق الوارد: رُصد ${r.matched} تسليم جديد`);
      // إرسال الشكر فوراً بعد رصد التسليم
      const cfg = loadConfig();
      if (!cfg.settings.paused) await runTick();
    }
  } catch (e: any) {
    console.error('خطأ في فحص صندوق الوارد:', e.message || e);
  }
}

const adminInit = ensureDefaultAdmin();
app.listen(env.port, () => {
  console.log(`✅ لوحة متابعة وثائق الجودة: http://localhost:${env.port}  (${env.dryRun ? 'وضع التجربة DRY_RUN' : 'إرسال فعلي'})`);
  if (adminInit.created) console.log(`   ⚠️ تم إنشاء مستخدم المدير الافتراضي "${adminInit.username}" - غيّر كلمة المرور من لوحة المتابعة فوراً`);
  console.log(`   المنطقة الزمنية: ${env.tz} | ساعة الإرسال: ${loadConfig().settings.sendHour}:00`);
  // فحص كل 10 دقائق: يُنفّذ الدورة مرة واحدة يومياً عند بلوغ ساعة الإرسال (مع تعويض إن كان الخادم متوقفاً وقتها)
  cron.schedule('*/10 * * * *', () => scheduledTick('مجدولة'), { timezone: env.tz });
  if (env.imap.enabled) cron.schedule(`*/${Math.max(1, env.imap.pollMinutes)} * * * *`, scheduledInbox, { timezone: env.tz });
  setTimeout(() => scheduledTick('عند التشغيل'), 3000);
});
