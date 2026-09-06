import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { channelConfigured, env } from './config.ts';
import { loadConfig, loadState, loadTemplates, newId, saveConfig, saveState, saveTemplates } from './store.ts';
import { buildManual, findSubmission, groupCell, groupsForDept, statusMatrix } from './engine.ts';
import { deadlineGroups } from './templates.ts';
import { executePlan, previewTick, runTick } from './runner.ts';
import { checkInbox } from './inbox.ts';
import { createTemplate, exportStatus, importExcel } from './excel.ts';
import { nowIso, todayInTz, isValidDate, formatArabic } from './dates.ts';
import { verifyEmail, sendEmail } from './channels/email.ts';
import { sendTeamsWebhook } from './channels/teams.ts';
import { sendWhatsApp } from './channels/whatsapp.ts';
import { attachUser, canSeeDept, changeOwnPassword, clearSessionCookie, createUser, deleteUser, ensureDefaultAdmin, listUsers, login, requireRole, setSessionCookie, updateUser, ROLE_AR } from './auth.ts';
import type { Channel, Config, Templates } from './types.ts';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use(attachUser);

  const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
  app.use(express.static(publicDir));

  const wrap = (fn: (req: express.Request, res: express.Response) => Promise<unknown> | unknown) => async (req: express.Request, res: express.Response) => {
    try {
      const r = await fn(req, res);
      if (!res.headersSent) res.json(r ?? { ok: true });
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message || e) });
    }
  };
  const viewer = requireRole('viewer');
  const editor = requireRole('editor');
  const admin = requireRole('admin');

  // ---------- الدخول والمستخدمون ----------
  app.post('/api/auth/login', wrap((req, res) => {
    const { user, token } = login(req.body?.username, req.body?.password);
    setSessionCookie(res, token);
    return { user };
  }));
  app.post('/api/auth/logout', wrap((_req, res) => { clearSessionCookie(res); }));
  app.get('/api/auth/me', wrap((req) => ({ user: req.user || null })));
  app.post('/api/auth/password', viewer, wrap((req) => { changeOwnPassword(req.user!.id, req.body?.current, req.body?.next); }));
  app.get('/api/users', admin, wrap(() => listUsers()));
  app.post('/api/users', admin, wrap((req) => createUser(req.body)));
  app.patch('/api/users/:id', admin, wrap((req) => updateUser(req.params.id as string, req.body, req.user!)));
  app.delete('/api/users/:id', admin, wrap((req) => { deleteUser(req.params.id as string, req.user!); }));

  const scopeDepts = (req: express.Request, cfg: Config) => cfg.departments.filter((d) => canSeeDept(req.user, d.id));

  app.get('/api/overview', viewer, wrap((req) => {
    const cfg = loadConfig();
    const state = loadState();
    const today = todayInTz(env.tz);
    const depts = scopeDepts(req, cfg);
    const cells = statusMatrix(cfg, state, today).filter((c) => depts.some((d) => d.id === c.deptId));
    const preview = previewTick(false);
    return {
      today, program: cfg.program, departments: depts, files: cfg.files, settings: cfg.settings, cells,
      groups: deadlineGroups(cfg.files).map((g) => ({ deadline: g.deadline, phase: g.phase, fileIds: g.files.map((f) => f.id) })),
      submissions: state.submissions.filter((s) => canSeeDept(req.user, s.deptId)), lastTickAt: state.lastTickAt, lastInboxCheckAt: state.lastInboxCheckAt,
      plannedToday: preview.plan.filter((p) => canSeeDept(req.user, p.deptId)).map((p) => ({ kind: p.kind, deptId: p.deptId, deadline: p.deadline, subject: p.subject })),
      env: { dryRun: env.dryRun, tz: env.tz, viceDeanEmail: env.viceDeanEmail, emailConfigured: channelConfigured.email(), whatsappConfigured: channelConfigured.whatsapp(), whatsappProvider: env.whatsapp.provider, imapEnabled: env.imap.enabled, teamsGlobalWebhook: Boolean(env.teamsWebhookUrl) },
      counts: { messages: state.messages.length, inboxUnhandled: state.inbox.filter((i) => !i.handled && canSeeDept(req.user, i.deptId)).length },
      user: req.user, roles: ROLE_AR,
    };
  }));

  app.put('/api/program', admin, wrap((req) => { const cfg = loadConfig(); cfg.program = { ...cfg.program, ...req.body }; if (!isValidDate(cfg.program.startDate)) throw new Error('تاريخ البداية غير صالح'); saveConfig(cfg); return cfg.program; }));
  app.put('/api/settings', admin, wrap((req) => { const cfg = loadConfig(); cfg.settings = { ...cfg.settings, ...req.body }; saveConfig(cfg); return cfg.settings; }));
  app.put('/api/departments', admin, wrap((req) => {
    const cfg = loadConfig();
    const list = req.body as Config['departments'];
    if (!Array.isArray(list)) throw new Error('صيغة غير صحيحة');
    cfg.departments = list.map((d, i) => ({ ...d, id: d.id || `D${i + 1}`, head: { ...d.head, name: d.head?.name || '', email: d.head?.email || '' }, cc: d.cc || [] }));
    saveConfig(cfg); return cfg.departments;
  }));
  app.put('/api/files', admin, wrap((req) => {
    const cfg = loadConfig();
    const list = req.body as Config['files'];
    if (!Array.isArray(list)) throw new Error('صيغة غير صحيحة');
    for (const f of list) if (!isValidDate(f.deadline)) throw new Error(`موعد غير صالح للوثيقة: ${f.name}`);
    cfg.files = list.map((f, i) => ({ ...f, id: f.id || f.number || `F${String(i + 1).padStart(2, '0')}`, keywords: f.keywords?.length ? f.keywords : [f.name] }));
    saveConfig(cfg); return cfg.files;
  }));

  app.get('/api/templates', viewer, wrap(() => loadTemplates()));
  app.put('/api/templates', admin, wrap((req) => { const t = { ...loadTemplates(), ...(req.body as Templates) }; saveTemplates(t); return t; }));

  const assertDept = (req: express.Request, deptId: string) => { if (!canSeeDept(req.user, deptId)) throw new Error('لا تملك صلاحية على هذا القسم'); };

  app.post('/api/submissions', editor, wrap((req) => {
    const { deptId, fileId, submittedAt, note } = req.body;
    assertDept(req, deptId);
    const cfg = loadConfig();
    if (!cfg.departments.some((d) => d.id === deptId) || !cfg.files.some((f) => f.id === fileId)) throw new Error('قسم أو وثيقة غير موجودة');
    const date = submittedAt || todayInTz(env.tz);
    if (!isValidDate(date)) throw new Error('تاريخ غير صالح');
    const state = loadState();
    if (state.submissions.some((s) => s.deptId === deptId && s.fileId === fileId)) throw new Error('التسليم مسجل مسبقاً');
    const sub = { id: newId('s_'), deptId, fileId, submittedAt: date, source: 'manual' as const, note, reviewStatus: 'pending' as const, createdAt: nowIso() };
    state.submissions.push(sub); saveState(state); return sub;
  }));
  /** تسجيل/إلغاء تسليم عدة وثائق دفعة واحدة لقسم معين */
  app.post('/api/submissions/bulk', editor, wrap((req) => {
    const { deptId, items } = req.body as { deptId: string; items: { fileId: string; submitted: boolean; submittedAt?: string; note?: string }[] };
    assertDept(req, deptId);
    const cfg = loadConfig();
    if (!cfg.departments.some((d) => d.id === deptId)) throw new Error('قسم غير موجود');
    const state = loadState();
    let added = 0, removed = 0, updated = 0;
    for (const it of items || []) {
      if (!cfg.files.some((f) => f.id === it.fileId)) continue;
      const existing = state.submissions.find((x) => x.deptId === deptId && x.fileId === it.fileId);
      if (it.submitted) {
        const date = it.submittedAt || todayInTz(env.tz);
        if (!isValidDate(date)) throw new Error('تاريخ غير صالح');
        if (existing) { if (existing.submittedAt !== date || (it.note !== undefined && it.note !== existing.note)) { existing.submittedAt = date; if (it.note !== undefined) existing.note = it.note; updated++; } }
        else { state.submissions.push({ id: newId('s_'), deptId, fileId: it.fileId, submittedAt: date, source: 'manual', note: it.note, reviewStatus: 'pending', createdAt: nowIso() }); added++; }
      } else if (existing) { state.submissions = state.submissions.filter((x) => x !== existing); removed++; }
    }
    saveState(state); return { added, removed, updated };
  }));
  app.patch('/api/submissions/:id', editor, wrap((req) => {
    const state = loadState();
    const s = state.submissions.find((x) => x.id === req.params.id);
    if (!s) throw new Error('غير موجود');
    assertDept(req, s.deptId);
    const { reviewStatus, note, submittedAt } = req.body;
    if (reviewStatus) s.reviewStatus = reviewStatus;
    if (note !== undefined) s.note = note;
    if (submittedAt) { if (!isValidDate(submittedAt)) throw new Error('تاريخ غير صالح'); s.submittedAt = submittedAt; }
    saveState(state); return s;
  }));
  app.delete('/api/submissions/:id', editor, wrap((req) => { const state = loadState(); const s = state.submissions.find((x) => x.id === req.params.id); if (s) assertDept(req, s.deptId); state.submissions = state.submissions.filter((x) => x.id !== req.params.id); saveState(state); }));

  app.get('/api/messages', viewer, wrap((req) => { const state = loadState(); const limit = Number(req.query.limit) || 200; return state.messages.filter((m) => canSeeDept(req.user, m.deptId)).slice(-limit).reverse(); }));
  app.get('/api/inbox', viewer, wrap((req) => loadState().inbox.filter((i) => canSeeDept(req.user, i.deptId))));
  app.post('/api/inbox/check', editor, wrap(() => checkInbox()));
  app.post('/api/inbox/:id/assign', editor, wrap((req) => {
    const state = loadState();
    const item = state.inbox.find((i) => i.id === req.params.id);
    if (!item) throw new Error('غير موجود');
    const { deptId, fileIds, submittedAt } = req.body as { deptId: string; fileIds: string[]; submittedAt?: string };
    assertDept(req, deptId);
    for (const fileId of fileIds || []) {
      if (state.submissions.some((s) => s.deptId === deptId && s.fileId === fileId)) continue;
      state.submissions.push({ id: newId('s_'), deptId, fileId, submittedAt: submittedAt || item.at.slice(0, 10), source: 'email', evidence: `بريد: "${item.subject}"`, reviewStatus: 'pending', createdAt: nowIso() });
    }
    item.deptId = deptId; item.matchedFileIds = fileIds || []; item.handled = true;
    saveState(state); return item;
  }));
  app.post('/api/inbox/:id/dismiss', editor, wrap((req) => { const state = loadState(); const item = state.inbox.find((i) => i.id === req.params.id); if (item) item.handled = true; saveState(state); }));

  app.get('/api/preview', viewer, wrap((req) => { const p = previewTick(req.query.force === '1'); return { ...p, plan: p.plan.filter((m) => canSeeDept(req.user, m.deptId)) }; }));
  app.post('/api/tick', editor, wrap((req) => runTick({ force: Boolean(req.body?.force), dryRun: req.body?.dryRun })));
  app.post('/api/send', editor, wrap(async (req) => {
    const { kind, deptId, deadline, channels, dryRun } = req.body as { kind: 'reminder' | 'kickoff' | 'overdue' | 'thanks'; deptId: string; deadline?: string; channels?: Channel[]; dryRun?: boolean };
    assertDept(req, deptId);
    const cfg = loadConfig();
    const state = loadState();
    const msg = buildManual(cfg, state, loadTemplates(), kind, deptId, deadline, todayInTz(env.tz), env.viceDeanEmail);
    if (!msg) throw new Error('تعذر بناء الرسالة (لا توجد وثائق مناسبة لهذا النوع)');
    msg.kind = 'manual';
    const logs = await executePlan([msg], state, { dryRun: dryRun ?? env.dryRun, only: channels });
    saveState(state); return logs;
  }));
  app.post('/api/markers/reset', admin, wrap((req) => { const state = loadState(); const { marker } = req.body; if (marker === '*') state.sentMarkers = {}; else delete state.sentMarkers[marker]; saveState(state); return state.sentMarkers; }));
  app.get('/api/markers', viewer, wrap(() => loadState().sentMarkers));

  /** بيانات تقرير الإنجاز لقسم معين (أو all لجميع الأقسام المتاحة للمستخدم) */
  app.get('/api/report/:deptId', viewer, wrap((req) => {
    const cfg = loadConfig();
    const state = loadState();
    const today = todayInTz(env.tz);
    const build = (d: Config['departments'][number]) => {
      const groups = groupsForDept(cfg, d).map((g) => {
        const c = groupCell(cfg, state, d, g, today);
        return {
          deadline: g.deadline, phase: g.phase, status: c.status, total: c.total, submitted: c.submitted, daysLeft: c.daysLeft,
          files: g.files.map((f) => { const sub = findSubmission(state, d.id, f.id); return { id: f.id, number: f.number, name: f.name, responsible: f.responsible, deadline: f.deadline, submittedAt: sub?.submittedAt, early: sub ? sub.submittedAt <= f.deadline : undefined, note: sub?.note, reviewStatus: sub?.reviewStatus, overdue: !sub && today > f.deadline }; }),
        };
      });
      const total = groups.reduce((a, g) => a + g.total, 0);
      const submitted = groups.reduce((a, g) => a + g.submitted, 0);
      const early = groups.reduce((a, g) => a + g.files.filter((f) => f.early === true).length, 0);
      const late = groups.reduce((a, g) => a + g.files.filter((f) => f.early === false).length, 0);
      const overdue = groups.reduce((a, g) => a + g.files.filter((f) => f.overdue).length, 0);
      return { department: d, groups, summary: { total, submitted, early, late, overdue, pending: total - submitted - overdue, percent: total ? Math.round((submitted / total) * 100) : 0 } };
    };
    const visible = scopeDepts(req, cfg);
    const depts = req.params.deptId === 'all' ? visible : visible.filter((d) => d.id === req.params.deptId);
    if (!depts.length) throw new Error('قسم غير موجود أو لا تملك صلاحية عليه');
    return { today, todayArabic: formatArabic(today), program: cfg.program, viceDeanEmail: env.viceDeanEmail, generatedBy: req.user?.name, reports: depts.map(build) };
  }));

  app.post('/api/test-channels', admin, wrap(async (req) => {
    const { email, phone, teamsWebhook } = req.body as { email?: string; phone?: string; teamsWebhook?: string };
    const out: Record<string, string> = {};
    const subject = 'رسالة اختبار - نظام متابعة وثائق الجودة';
    const body = 'هذه رسالة اختبار للتأكد من إعدادات الإرسال. لا يلزم الرد.';
    if (email) { try { await verifyEmail(); await sendEmail(email, subject, body); out.email = 'تم الإرسال'; } catch (e: any) { out.email = 'فشل: ' + e.message; } }
    if (phone) { try { await sendWhatsApp(phone, subject, body); out.whatsapp = 'تم الإرسال'; } catch (e: any) { out.whatsapp = 'فشل: ' + e.message; } }
    if (teamsWebhook) { try { await sendTeamsWebhook(teamsWebhook, subject, body); out.teams = 'تم الإرسال'; } catch (e: any) { out.teams = 'فشل: ' + e.message; } }
    return out;
  }));

  const exportsDir = path.join(env.dataDir, '..', 'exports');
  app.get('/api/export.xlsx', viewer, wrap(async (_req, res) => {
    const file = await exportStatus(path.join(exportsDir, `quality-status-${todayInTz(env.tz)}.xlsx`));
    await new Promise<void>((resolve, reject) => res.download(file, (err) => (err ? reject(err) : resolve())));
  }));
  app.get('/api/template.xlsx', viewer, wrap(async (_req, res) => {
    const file = await createTemplate(path.join(exportsDir, 'quality-template.xlsx'));
    await new Promise<void>((resolve, reject) => res.download(file, (err) => (err ? reject(err) : resolve())));
  }));
  app.post('/api/import', editor, express.raw({ type: '*/*', limit: '20mb' }), wrap(async (req) => {
    const tmp = path.join(exportsDir, `import-${Date.now()}.xlsx`);
    fs.mkdirSync(exportsDir, { recursive: true });
    fs.writeFileSync(tmp, req.body as Buffer);
    try { return await importExcel(tmp, { replace: req.query.replace === '1' }); } finally { fs.rmSync(tmp, { force: true }); }
  }));

  return app;
}

export { ensureDefaultAdmin };
