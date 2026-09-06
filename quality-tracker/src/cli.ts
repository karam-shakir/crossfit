/** أوامر سطر الأوامر: tick | preview | inbox | excel-template | excel-import <file> | excel-export [file] | test-channels */
import path from 'node:path';
import { env } from './config.ts';
import { previewTick, runTick } from './runner.ts';
import { checkInbox } from './inbox.ts';
import { createTemplate, exportStatus, importExcel } from './excel.ts';
import { todayInTz } from './dates.ts';
import { verifyEmail } from './channels/email.ts';

const [cmd, ...args] = process.argv.slice(2);
const exportsDir = path.join(env.dataDir, '..', 'exports');

async function main() {
  switch (cmd) {
    case 'tick': {
      const force = args.includes('--force');
      const r = await runTick({ force });
      console.log(`[${r.today}] رسائل مخططة: ${r.planned} | ${env.dryRun ? 'وضع التجربة (DRY_RUN)' : 'إرسال فعلي'}`);
      for (const l of r.logs) console.log(` - ${l.kind} | ${l.channel} | ${l.to} | ${l.status}${l.error ? ' | ' + l.error : ''}`);
      break;
    }
    case 'preview': {
      const p = previewTick(args.includes('--force'));
      console.log(`اليوم ${p.today}${p.paused ? ' (النظام موقوف مؤقتاً)' : ''} - الرسائل التي ستُرسل في الدورة القادمة: ${p.plan.length}`);
      for (const m of p.plan) console.log(`\n=== ${m.kind} | ${m.deptId || ''} | ${m.deadline || ''} ===\nإلى: ${m.recipients.email || ''} ${m.recipients.phone || ''}\nالعنوان: ${m.subject}\n${m.body}`);
      break;
    }
    case 'inbox': {
      const r = await checkInbox();
      console.log(`تم فحص ${r.scanned} رسالة، رُصد ${r.matched} تسليم`);
      break;
    }
    case 'excel-template': {
      const out = await createTemplate(args[0] || path.join(exportsDir, 'quality-template.xlsx'));
      console.log('تم إنشاء القالب:', out);
      break;
    }
    case 'excel-import': {
      if (!args[0]) throw new Error('الاستخدام: npm run excel:import -- <ملف.xlsx> [--replace]');
      const r = await importExcel(args[0], { replace: args.includes('--replace') });
      console.log(`أقسام: ${r.departments} | ملفات: ${r.files} | تسليمات: ${r.submissions} | إعدادات: ${r.settings}`);
      for (const w of r.warnings) console.warn('تنبيه:', w);
      break;
    }
    case 'excel-export': {
      const out = await exportStatus(args[0] || path.join(exportsDir, `quality-status-${todayInTz(env.tz)}.xlsx`));
      console.log('تم التصدير:', out);
      break;
    }
    case 'test-channels': {
      try { await verifyEmail(); console.log('SMTP: الاتصال ناجح ✅'); } catch (e: any) { console.log('SMTP: فشل ❌', e.message); }
      console.log('WhatsApp provider:', env.whatsapp.provider);
      console.log('IMAP:', env.imap.enabled ? 'مفعّل' : 'غير مفعّل');
      break;
    }
    default:
      console.log('الأوامر: tick [--force] | preview [--force] | inbox | excel-template [out] | excel-import <file> [--replace] | excel-export [out] | test-channels');
  }
}

main().catch((e) => { console.error('خطأ:', e.message || e); process.exit(1); });
