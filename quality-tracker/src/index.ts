/** تشغيل الخادم + المجدول التلقائي */
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`❌ إصدار Node.js الحالي ${process.versions.node} قديم. يلزم Node.js 18 أو أحدث: https://nodejs.org`);
  process.exit(1);
}
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

let adminInit: { created: boolean; username: string };
try {
  loadConfig();
  adminInit = ensureDefaultAdmin();
} catch (e: any) {
  console.error('❌ تعذر قراءة ملفات البيانات:', e.message || e);
  console.error(`   مجلد البيانات: ${env.dataDir}`);
  process.exit(1);
}
const server = app.listen(env.port, () => {
  console.log(`✅ لوحة متابعة وثائق الجودة: http://localhost:${env.port}  (${env.dryRun ? 'وضع التجربة DRY_RUN' : 'إرسال فعلي'})`);
  if (adminInit.created) console.log(`   ⚠️ تم إنشاء مستخدم المدير الافتراضي "${adminInit.username}" - غيّر كلمة المرور من لوحة المتابعة فوراً`);
  console.log(`   المنطقة الزمنية: ${env.tz} | ساعة الإرسال: ${loadConfig().settings.sendHour}:00`);
  // فحص كل 10 دقائق: يُنفّذ الدورة مرة واحدة يومياً عند بلوغ ساعة الإرسال (مع تعويض إن كان الخادم متوقفاً وقتها)
  cron.schedule('*/10 * * * *', () => scheduledTick('مجدولة'), { timezone: env.tz });
  if (env.imap.enabled) cron.schedule(`*/${Math.max(1, env.imap.pollMinutes)} * * * *`, scheduledInbox, { timezone: env.tz });
  setTimeout(() => scheduledTick('عند التشغيل'), 3000);
});
server.on('error', (e: any) => {
  if (e.code === 'EADDRINUSE') console.error(`❌ المنفذ ${env.port} مستخدم من برنامج آخر. غيّر PORT في ملف .env (مثلاً PORT=4001) أو أغلق البرنامج الآخر.`);
  else console.error('❌ تعذر تشغيل الخادم:', e.message || e);
  process.exit(1);
});
