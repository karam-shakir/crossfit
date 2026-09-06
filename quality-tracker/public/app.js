/* لوحة متابعة وثائق الجودة - واجهة بسيطة بدون مكتبات */
const $ = (s) => document.querySelector(s);
const KIND = { kickoff: 'انطلاق', reminder: 'تذكير', thanks: 'شكر', late_ack: 'إشعار استلام', overdue: 'تأخر', report: 'تقرير', manual: 'يدوي' };
const STATUS = { sent: 'مُرسلة', failed: 'فشلت', dry_run: 'تجربة', manual_pending: 'إرسال يدوي', skipped: 'تخطي' };
const CELL = { complete_early: 'اكتمل قبل الموعد', complete_late: 'اكتمل بعد الموعد', partial: 'تسليم جزئي', pending: 'لم يُسلّم', due_soon: 'الموعد قريب', overdue: 'متأخر', not_applicable: 'غير مطلوب' };
const CH = { email: 'بريد', teams: 'Teams', whatsapp: 'واتساب' };
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const RANK = { viewer: 1, editor: 2, admin: 3 };
let O = null; // overview

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = (s) => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; };
const fmtTs = (s) => s ? new Date(s).toLocaleString('ar-SA-u-ca-gregory-nu-latn', { dateStyle: 'short', timeStyle: 'short' }) : '';
const dept = (id) => (O.departments.find((d) => d.id === id) || {}).name || id || '';
const fileOf = (id) => O.files.find((f) => f.id === id) || { name: id };
const fileLabel = (f) => `${f.number && f.number !== '—' ? '(' + f.number + ') ' : ''}${f.name}`;
const can = (role) => O && O.user && RANK[O.user.role] >= RANK[role];

function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), ms); }
async function api(url, opts = {}) {
  const isRaw = opts.body instanceof ArrayBuffer;
  const r = await fetch(url, { ...opts, headers: { 'Content-Type': isRaw ? 'application/octet-stream' : 'application/json', ...(opts.headers || {}) }, body: opts.body && !isRaw && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = '/login.html?next=' + encodeURIComponent(location.pathname); throw new Error('يلزم تسجيل الدخول'); }
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
function modal(html) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; }
function closeModal() { $('#modal').hidden = true; }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

// ---------- تبويبات ----------
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('active', x === b));
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x.id === 'tab-' + b.dataset.tab));
  ({ messages: loadMessages, inbox: loadInbox, templates: loadTemplates, settings: renderSettings, planned: loadPlanned, users: loadUsers, reports: renderReports })[b.dataset.tab]?.();
});

// ---------- تحميل عام ----------
async function load() {
  O = await api('/api/overview');
  $('#programName').textContent = O.program.name;
  $('#programSub').textContent = `${O.program.semester || ''} ${O.program.academicYear || ''} | بداية العمل: ${fmtDate(O.program.startDate)} | آخر دورة: ${fmtTs(O.lastTickAt) || 'لم تُنفذ بعد'}`;
  $('#todayBadge').textContent = 'اليوم ' + fmtDate(O.today);
  $('#dryBadge').hidden = !O.env.dryRun;
  $('#pausedBadge').hidden = !O.settings.paused;
  $('#btnPause').textContent = O.settings.paused ? '▶ استئناف الإرسال' : '⏸ إيقاف مؤقت';
  $('#plannedCount').textContent = O.plannedToday.length;
  $('#inboxCount').textContent = O.counts.inboxUnhandled;
  $('#userBadge').textContent = `${O.user.name} (${O.roles[O.user.role]})`;
  document.querySelectorAll('[data-role]').forEach((el) => { el.hidden = !can(el.dataset.role); });
  renderTiles(); renderMatrix(); if (can('admin')) { renderDepts(); renderFiles(); }
}

function renderTiles() {
  const cells = O.cells.filter((c) => c.status !== 'not_applicable');
  const total = cells.reduce((a, c) => a + c.total, 0), done = cells.reduce((a, c) => a + c.submitted, 0);
  const overdueDocs = cells.filter((c) => c.daysLeft < 0).reduce((a, c) => a + (c.total - c.submitted), 0);
  const tiles = [
    ['إجمالي الوثائق المطلوبة', total], ['وثائق مستلمة', done], ['نسبة الإنجاز', total ? Math.round((done / total) * 100) + '%' : '0%'],
    ['مواعيد اكتملت قبل وقتها', cells.filter((c) => c.status === 'complete_early').length], ['مواعيد قريبة (تسليم ناقص)', cells.filter((c) => c.status === 'due_soon' || (c.status === 'partial' && c.daysLeft >= 0)).length], ['وثائق متأخرة', overdueDocs],
  ];
  $('#tiles').innerHTML = tiles.map(([l, v]) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('');
}

function renderMatrix() {
  let h = '<thead><tr><th>القسم</th>' + O.groups.map((g) => {
    const dl = Math.round((Date.parse(g.deadline) - Date.parse(O.today)) / 864e5);
    return `<th class="file">${esc(g.phase || 'موعد تسليم')}<small>الموعد: ${fmtDate(g.deadline)} · ${g.fileIds.length} وثيقة</small><small>${dl < 0 ? `انقضى منذ ${-dl} يوم` : dl === 0 ? 'اليوم' : `متبقي ${dl} يوم`}</small></th>`;
  }).join('') + '</tr></thead><tbody>';
  for (const d of O.departments) {
    h += `<tr><th>${esc(d.name)}${d.active === false ? ' <span class="tag">غير نشط</span>' : ''}<small class="muted" style="display:block">${esc(d.head.name)}</small></th>`;
    for (const g of O.groups) {
      const c = O.cells.find((x) => x.deptId === d.id && x.deadline === g.deadline);
      h += `<td class="cell st-${c.status}" data-d="${d.id}" data-dl="${g.deadline}">${CELL[c.status]}${c.total ? `<small>${c.submitted}/${c.total} وثيقة${c.lastSubmittedAt ? ' · ' + fmtDate(c.lastSubmittedAt) : ''}</small>` : ''}${c.reminderSent && c.submitted < c.total ? '<small>🔔 تم التذكير</small>' : ''}${c.thanksSent ? '<small>✉️ أُرسل الشكر</small>' : ''}</td>`;
    }
    h += '</tr>';
  }
  $('#matrix').innerHTML = h + '</tbody>';
}

$('#matrix').addEventListener('click', (e) => {
  const td = e.target.closest('td.cell'); if (!td) return;
  const { d, dl } = td.dataset;
  const c = O.cells.find((x) => x.deptId === d && x.deadline === dl);
  if (!c || c.status === 'not_applicable') return;
  const editable = can('editor');
  const rows = c.files.map((f) => { const fl = fileOf(f.id); const s = f.submission; return `<tr><td><input type="checkbox" class="chk" data-f="${f.id}" ${s ? 'checked' : ''} ${editable ? '' : 'disabled'}></td><td>${esc(fileLabel(fl))}<small class="muted" style="display:block">${esc(fl.responsible || '')}</small></td><td><input type="date" class="dt" data-f="${f.id}" value="${s ? s.submittedAt : O.today}" style="width:150px" ${editable ? '' : 'disabled'}></td><td>${s ? (s.submittedAt <= dl ? '<span class="tag ok">قبل الموعد</span>' : '<span class="tag bad">بعد الموعد</span>') + (s.source === 'email' ? ' 📧' : '') : ''}</td></tr>`; }).join('');
  modal(`<h3>${esc(dept(d))}</h3><p><b>${esc(c.phase || 'الوثائق المستحقة')}</b><br>الموعد النهائي: ${fmtDate(dl)} — المستلم ${c.submitted}/${c.total}${c.thanksSent ? ' — ✉️ أُرسلت رسالة الشكر/الاستلام' : ''}</p>
    <div class="table-wrap" style="max-height:50vh;overflow:auto"><table class="grid"><thead><tr><th>مستلم</th><th>الوثيقة</th><th>تاريخ الاستلام</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="actions">${editable ? `<button class="btn primary" id="mSave">💾 حفظ الاستلام</button><button class="btn ghost" id="mAll">تحديد الكل</button><button class="btn ghost" id="mRemind">🔔 تذكير بالناقص الآن</button><button class="btn ghost" id="mThanks">🙏 رسالة شكر الآن</button>${c.daysLeft < 0 ? '<button class="btn ghost" id="mOverdue">⚠ تنبيه تأخر</button>' : ''}` : ''}<button class="btn ghost" onclick="closeModal()">إغلاق</button></div>
    <p class="hint">عند اكتمال استلام جميع وثائق الموعد قبل انتهائه تُرسل رسالة الشكر تلقائياً في الدورة القادمة.</p>`);
  $('#mAll')?.addEventListener('click', () => document.querySelectorAll('#modal .chk').forEach((x) => (x.checked = true)));
  $('#mSave')?.addEventListener('click', async () => {
    const items = [...document.querySelectorAll('#modal .chk')].map((x) => ({ fileId: x.dataset.f, submitted: x.checked, submittedAt: document.querySelector(`#modal .dt[data-f="${x.dataset.f}"]`).value }));
    try { const r = await api('/api/submissions/bulk', { method: 'POST', body: { deptId: d, items } }); closeModal(); toast(`تم الحفظ: ${r.added} إضافة، ${r.updated} تعديل، ${r.removed} إلغاء`); load(); } catch (e) { toast(e.message); }
  });
  $('#mRemind')?.addEventListener('click', () => sendManual('reminder', d, dl));
  $('#mThanks')?.addEventListener('click', () => sendManual('thanks', d, dl));
  $('#mOverdue')?.addEventListener('click', () => sendManual('overdue', d, dl));
});

async function sendManual(kind, deptId, deadline) {
  try { const logs = await api('/api/send', { method: 'POST', body: { kind, deptId, deadline } }); closeModal(); showLogs(logs); load(); } catch (e) { toast(e.message, 5000); }
}
function showLogs(logs) {
  modal(`<h3>نتيجة الإرسال</h3>${logs.map((l) => `<div class="msg"><b>${CH[l.channel]}</b> → ${esc(l.to)}: <span class="status-${l.status}">${STATUS[l.status]}</span>${l.error ? `<div class="muted">${esc(l.error)}</div>` : ''}${l.manualLink ? `<div><a class="btn sm ghost" target="_blank" href="${esc(l.manualLink)}">فتح ${CH[l.channel]} وإرسال يدوياً</a></div>` : ''}</div>`).join('') || '<p class="muted">لا شيء</p>'}<div class="actions"><button class="btn ghost" onclick="closeModal()">إغلاق</button></div>`);
}

// ---------- الرأس ----------
$('#btnPause').addEventListener('click', async () => { await api('/api/settings', { method: 'PUT', body: { paused: !O.settings.paused } }); load(); });
$('#btnTick').addEventListener('click', async () => {
  if (!O.plannedToday.length) { toast('لا توجد رسائل مخططة اليوم'); return; }
  if (!confirm(`سيتم ${O.env.dryRun ? 'محاكاة إرسال' : 'إرسال'} ${O.plannedToday.length} رسالة. متابعة؟`)) return;
  try { const r = await api('/api/tick', { method: 'POST', body: {} }); showLogs(r.logs); load(); } catch (e) { toast(e.message); }
});
$('#btnLogout').addEventListener('click', async () => { await api('/api/auth/logout', { method: 'POST', body: {} }); location.href = '/login.html'; });
$('#btnPassword').addEventListener('click', () => {
  modal(`<h3>تغيير كلمة المرور</h3><label>كلمة المرور الحالية <input type="password" id="pwCur"></label><label>كلمة المرور الجديدة <input type="password" id="pwNew"></label><div class="actions"><button class="btn primary" id="pwOk">حفظ</button><button class="btn ghost" onclick="closeModal()">إلغاء</button></div>`);
  $('#pwOk').onclick = async () => { try { await api('/api/auth/password', { method: 'POST', body: { current: $('#pwCur').value, next: $('#pwNew').value } }); closeModal(); toast('تم تغيير كلمة المرور'); } catch (e) { toast(e.message); } };
});

// ---------- التقارير ----------
function renderReports() {
  const cards = [`<div class="card"><h3>التقرير الإجمالي</h3><p class="muted">ملخص إنجاز جميع الأقسام + تقرير مستقل لكل قسم في ملف واحد.</p><a class="btn primary" target="_blank" href="/report.html?dept=all">عرض / طباعة</a></div>`];
  for (const d of O.departments) {
    const cells = O.cells.filter((c) => c.deptId === d.id);
    const total = cells.reduce((a, c) => a + c.total, 0), done = cells.reduce((a, c) => a + c.submitted, 0);
    cards.push(`<div class="card"><h3>${esc(d.name)}</h3><p class="muted">${esc(d.head.name)}</p><p><b>${done}/${total}</b> وثيقة مستلمة (${total ? Math.round((done / total) * 100) : 0}%)</p><a class="btn primary" target="_blank" href="/report.html?dept=${encodeURIComponent(d.id)}">تقرير الإنجاز</a></div>`);
  }
  $('#reportCards').innerHTML = cards.join('');
}

// ---------- المخطط ----------
async function loadPlanned(force = false) {
  const p = await api('/api/preview' + (force ? '?force=1' : ''));
  $('#plannedList').innerHTML = p.plan.length ? p.plan.map((m) => `<div class="msg"><h4>${KIND[m.kind]} ${m.deptId ? '— ' + esc(dept(m.deptId)) : ''} ${m.deadline ? '— موعد ' + fmtDate(m.deadline) : ''}</h4><div class="muted">إلى: ${esc(m.recipients.email || '')} ${m.recipients.phone ? '| واتساب ' + esc(m.recipients.phone) : ''} ${m.recipients.teamsWebhook ? '| Teams' : ''}</div><b>${esc(m.subject)}</b><pre>${esc(m.body)}</pre></div>`).join('')
    : `<div class="msg">${p.paused ? 'النظام موقوف مؤقتاً.' : 'لا توجد رسائل مستحقة اليوم.'} <span class="muted">يتم التحقق يومياً عند ساعة الإرسال.</span></div>`;
}
$('#btnPreviewForce').addEventListener('click', () => loadPlanned(true));

// ---------- سجل الرسائل ----------
async function loadMessages() {
  const list = await api('/api/messages?limit=500');
  const k = $('#msgFilterKind').value, s = $('#msgFilterStatus').value;
  const rows = list.filter((m) => (!k || m.kind === k) && (!s || m.status === s));
  $('#messagesTable').innerHTML = '<thead><tr><th>الوقت</th><th>النوع</th><th>القناة</th><th>القسم</th><th>الموعد</th><th>إلى</th><th>الحالة</th><th>العنوان</th><th></th></tr></thead><tbody>' +
    (rows.map((m) => `<tr><td>${fmtTs(m.at)}</td><td>${KIND[m.kind] || m.kind}</td><td>${CH[m.channel]}</td><td>${esc(dept(m.deptId))}</td><td>${m.deadline ? fmtDate(m.deadline) : ''}</td><td>${esc(m.to)}</td><td class="status-${m.status}">${STATUS[m.status]}${m.error ? `<br><small class="muted">${esc(m.error)}</small>` : ''}</td><td>${esc(m.subject || '')}</td><td>${m.manualLink ? `<a class="btn sm ghost" target="_blank" href="${esc(m.manualLink)}">إرسال يدوي</a> ` : ''}<button class="btn sm ghost" data-view="${m.id}">عرض</button></td></tr>`).join('') || '<tr><td colspan="9" class="muted">لا توجد رسائل</td></tr>') + '</tbody>';
  $('#messagesTable').onclick = (e) => { const b = e.target.closest('[data-view]'); if (!b) return; const m = list.find((x) => x.id === b.dataset.view); modal(`<h3>${esc(m.subject || '')}</h3><pre class="msg" style="white-space:pre-wrap">${esc(m.body)}</pre><div class="actions"><button class="btn ghost" onclick="closeModal()">إغلاق</button></div>`); };
}
$('#btnReloadMsgs').addEventListener('click', loadMessages);
$('#msgFilterKind').addEventListener('change', loadMessages); $('#msgFilterStatus').addEventListener('change', loadMessages);

// ---------- صندوق الوارد ----------
async function loadInbox() {
  const list = await api('/api/inbox');
  $('#inboxInfo').textContent = O.env.imapEnabled ? `الفحص التلقائي مفعّل | آخر فحص: ${fmtTs(O.lastInboxCheckAt) || '-'}` : 'الفحص التلقائي غير مفعّل (IMAP_ENABLED=false) - يمكنك تسجيل الاستلام يدوياً من لوحة الحالة';
  const editable = can('editor');
  $('#inboxTable').innerHTML = '<thead><tr><th>الوقت</th><th>من</th><th>العنوان</th><th>المرفقات</th><th>القسم</th><th>الوثائق المطابقة</th><th>الحالة</th><th></th></tr></thead><tbody>' +
    (list.map((i) => `<tr><td>${fmtTs(i.at)}</td><td>${esc(i.from)}</td><td>${esc(i.subject)}</td><td>${esc(i.attachments.join(', '))}</td><td>${esc(dept(i.deptId))}</td><td>${(i.matchedFileIds || []).map((f) => esc(fileLabel(fileOf(f)))).join('<br>')}</td><td>${i.handled ? '✅ مُعالج' : '⚠ يحتاج تصنيف'}</td><td>${i.handled || !editable ? '' : `<button class="btn sm primary" data-assign="${i.id}">تصنيف كتسليم</button> <button class="btn sm ghost" data-dismiss="${i.id}">تجاهل</button>`}</td></tr>`).join('') || '<tr><td colspan="8" class="muted">لا توجد رسائل مرصودة</td></tr>') + '</tbody>';
  $('#inboxTable').onclick = async (e) => {
    const a = e.target.closest('[data-assign]'), d = e.target.closest('[data-dismiss]');
    if (d) { await api(`/api/inbox/${d.dataset.dismiss}/dismiss`, { method: 'POST', body: {} }); loadInbox(); load(); }
    if (a) {
      const i = list.find((x) => x.id === a.dataset.assign);
      modal(`<h3>تصنيف رسالة كتسليم</h3><p>${esc(i.subject)}</p><label>القسم <select id="aDept">${O.departments.map((x) => `<option value="${x.id}" ${x.id === i.deptId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label>الوثائق المستلمة</label><div style="max-height:40vh;overflow:auto">${O.files.map((f) => `<label><input type="checkbox" class="aF" value="${f.id}" ${(i.matchedFileIds || []).includes(f.id) ? 'checked' : ''}> ${esc(fileLabel(f))}</label>`).join('')}</div>
        <label>تاريخ التسليم <input type="date" id="aDate" value="${i.at.slice(0, 10)}"></label><div class="actions"><button class="btn primary" id="aOk">تأكيد</button><button class="btn ghost" onclick="closeModal()">إلغاء</button></div>`);
      $('#aOk').onclick = async () => { try { await api(`/api/inbox/${i.id}/assign`, { method: 'POST', body: { deptId: $('#aDept').value, fileIds: [...document.querySelectorAll('#modal .aF:checked')].map((x) => x.value), submittedAt: $('#aDate').value } }); closeModal(); loadInbox(); load(); } catch (e) { toast(e.message); } };
    }
  };
}
$('#btnInboxCheck').addEventListener('click', async () => { try { toast('جاري الفحص...'); const r = await api('/api/inbox/check', { method: 'POST', body: {} }); toast(`تم فحص ${r.scanned} رسالة، رُصد ${r.matched} تسليم`); await load(); loadInbox(); } catch (e) { toast('فشل الفحص: ' + e.message, 5000); } });

// ---------- الأقسام ----------
let deptsDraft = [];
function renderDepts() {
  deptsDraft = JSON.parse(JSON.stringify(O.departments));
  const inp = (i, k, v) => `<input data-i="${i}" data-k="${k}" value="${esc(v)}">`;
  $('#deptTable').innerHTML = '<thead><tr><th>الرمز</th><th>اسم القسم</th><th>رئيس القسم</th><th>البريد</th><th>واتساب</th><th>بريد Teams</th><th>Teams Webhook</th><th>نسخة إلى</th><th>نشط</th><th></th></tr></thead><tbody>' +
    deptsDraft.map((d, i) => `<tr>${['id', 'name', 'head.name', 'head.email', 'head.phone', 'head.teamsEmail', 'head.teamsWebhook', 'cc'].map((k) => `<td>${inp(i, k, k === 'cc' ? (d.cc || []).join(', ') : k.startsWith('head.') ? d.head[k.slice(5)] || '' : d[k] || '')}</td>`).join('')}<td><input type="checkbox" data-i="${i}" data-k="active" ${d.active !== false ? 'checked' : ''}></td><td><button class="btn sm danger" data-del="${i}">حذف</button></td></tr>`).join('') + '</tbody>';
}
$('#deptTable').addEventListener('input', (e) => { const { i, k } = e.target.dataset; if (i === undefined) return; const d = deptsDraft[i]; const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; if (k === 'cc') d.cc = v.split(/[;,، ]+/).filter(Boolean); else if (k.startsWith('head.')) d.head[k.slice(5)] = v; else d[k] = v; });
$('#deptTable').addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (!b) return; deptsDraft.splice(Number(b.dataset.del), 1); O.departments = deptsDraft; renderDepts(); });
$('#btnAddDept').addEventListener('click', () => { deptsDraft.push({ id: 'D' + (deptsDraft.length + 1), name: 'قسم جديد', head: { name: '', email: '', phone: '', teamsEmail: '', teamsWebhook: '' }, cc: [], active: true }); O.departments = deptsDraft; renderDepts(); });
$('#btnSaveDepts').addEventListener('click', async () => { try { await api('/api/departments', { method: 'PUT', body: deptsDraft }); toast('تم حفظ الأقسام'); load(); } catch (e) { toast(e.message); } });

// ---------- الوثائق ----------
let filesDraft = [];
function renderFiles() {
  filesDraft = JSON.parse(JSON.stringify(O.files));
  $('#fileTable').innerHTML = '<thead><tr><th>الرمز</th><th>رقم الوثيقة</th><th>المرحلة</th><th>الوثيقة</th><th>مسؤولية التنفيذ</th><th>الوصف</th><th>الموعد النهائي</th><th>الكلمات المفتاحية</th><th>الأقسام المعنية</th><th></th></tr></thead><tbody>' +
    filesDraft.map((f, i) => `<tr><td><input data-i="${i}" data-k="id" value="${esc(f.id)}" style="width:80px"></td><td><input data-i="${i}" data-k="number" value="${esc(f.number || '')}" style="width:70px"></td><td><input data-i="${i}" data-k="phase" value="${esc(f.phase || '')}"></td><td><input data-i="${i}" data-k="name" value="${esc(f.name)}"></td><td><input data-i="${i}" data-k="responsible" value="${esc(f.responsible || '')}"></td><td><input data-i="${i}" data-k="description" value="${esc(f.description || '')}"></td><td><input type="date" data-i="${i}" data-k="deadline" value="${f.deadline}"></td><td><input data-i="${i}" data-k="keywords" value="${esc((f.keywords || []).join(', '))}"></td><td><input data-i="${i}" data-k="departments" value="${esc((f.departments || []).join(', '))}" placeholder="الكل"></td><td><button class="btn sm danger" data-del="${i}">حذف</button></td></tr>`).join('') + '</tbody>';
}
$('#fileTable').addEventListener('input', (e) => { const { i, k } = e.target.dataset; if (i === undefined) return; const f = filesDraft[i]; const v = e.target.value; if (k === 'keywords') f.keywords = v.split(/[;,،]+/).map((s) => s.trim()).filter(Boolean); else if (k === 'departments') { f.departments = v.split(/[;,، ]+/).filter(Boolean); if (!f.departments.length) delete f.departments; } else f[k] = v; });
$('#fileTable').addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (!b) return; filesDraft.splice(Number(b.dataset.del), 1); O.files = filesDraft; renderFiles(); });
$('#btnAddFile').addEventListener('click', () => { filesDraft.push({ id: 'F' + String(filesDraft.length + 1).padStart(2, '0'), number: '', phase: filesDraft.at(-1)?.phase || '', name: 'وثيقة جديدة', responsible: '', description: '', deadline: filesDraft.at(-1)?.deadline || O.today, keywords: [] }); O.files = filesDraft; renderFiles(); });
$('#btnSaveFiles').addEventListener('click', async () => { try { await api('/api/files', { method: 'PUT', body: filesDraft }); toast('تم حفظ الوثائق والجدول الزمني'); load(); } catch (e) { toast(e.message); } });

// ---------- القوالب ----------
let T = null;
async function loadTemplates() {
  T = await api('/api/templates');
  const keys = [['kickoff', 'رسالة الانطلاق (بداية العمل + الجدول الزمني الكامل)'], ['reminder', 'رسالة التذكير قبل الموعد (بالوثائق الناقصة)'], ['thanks', 'رسالة الشكر عند اكتمال التسليم قبل الموعد'], ['late_ack', 'إشعار الاستلام عند اكتمال التسليم بعد الموعد'], ['overdue', 'تنبيه التأخر'], ['report', 'تقرير الوكيل']];
  $('#templatesForm').innerHTML = keys.map(([k, l]) => `<div class="card" style="margin-bottom:12px"><h3>${l}</h3><label>العنوان <input data-t="${k}" data-p="subject" value="${esc(T[k].subject)}"></label><label>النص <textarea data-t="${k}" data-p="body">${esc(T[k].body)}</textarea></label></div>`).join('') + `<div class="card"><h3>التوقيع</h3><textarea data-t="signature" style="min-height:70px">${esc(T.signature)}</textarea></div>`;
}
$('#btnSaveTemplates').addEventListener('click', async () => {
  document.querySelectorAll('#templatesForm [data-t]').forEach((el) => { if (el.dataset.t === 'signature') T.signature = el.value; else T[el.dataset.t][el.dataset.p] = el.value; });
  try { await api('/api/templates', { method: 'PUT', body: T }); toast('تم حفظ القوالب'); } catch (e) { toast(e.message); }
});

// ---------- المستخدمون ----------
async function loadUsers() {
  const users = await api('/api/users');
  $('#usersTable').innerHTML = '<thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>الأقسام</th><th>نشط</th><th>آخر دخول</th><th></th></tr></thead><tbody>' +
    users.map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.username)}</td><td>${O.roles[u.role]}</td><td>${(u.deptIds || []).map(dept).map(esc).join('، ') || 'جميع الأقسام'}</td><td>${u.active ? '✅' : '⛔'}</td><td>${fmtTs(u.lastLoginAt) || '-'}</td><td><button class="btn sm ghost" data-edit="${u.id}">تعديل</button> <button class="btn sm danger" data-udel="${u.id}">حذف</button></td></tr>`).join('') + '</tbody>';
  $('#usersTable').onclick = async (e) => {
    const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-udel]');
    if (del) { if (!confirm('حذف المستخدم؟')) return; try { await api('/api/users/' + del.dataset.udel, { method: 'DELETE' }); loadUsers(); } catch (ex) { toast(ex.message); } }
    if (ed) userForm(users.find((u) => u.id === ed.dataset.edit));
  };
}
function userForm(u) {
  const deptChecks = O.departments.map((d) => `<label style="display:inline-block;margin:2px 8px"><input type="checkbox" class="uD" value="${d.id}" ${(u?.deptIds || []).includes(d.id) ? 'checked' : ''}> ${esc(d.shortName || d.name)}</label>`).join('');
  modal(`<h3>${u ? 'تعديل مستخدم' : 'إضافة مستخدم'}</h3>
    <label>الاسم <input id="uName" value="${esc(u?.name || '')}"></label>
    ${u ? '' : '<label>اسم المستخدم <input id="uUser" autocomplete="off"></label>'}
    <label>${u ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور'} <input id="uPass" type="password" autocomplete="new-password"></label>
    <label>الدور <select id="uRole"><option value="viewer" ${u?.role === 'viewer' ? 'selected' : ''}>مشاهد (قراءة فقط)</option><option value="editor" ${u?.role === 'editor' ? 'selected' : ''}>متابع (تسجيل التسليم والإرسال)</option><option value="admin" ${u?.role === 'admin' ? 'selected' : ''}>مدير النظام</option></select></label>
    <label>تقييد بأقسام محددة (اتركها فارغة لجميع الأقسام)</label><div>${deptChecks}</div>
    ${u ? `<label><input type="checkbox" id="uActive" ${u.active ? 'checked' : ''}> الحساب نشط</label>` : ''}
    <div class="actions"><button class="btn primary" id="uOk">حفظ</button><button class="btn ghost" onclick="closeModal()">إلغاء</button></div>`);
  $('#uOk').onclick = async () => {
    const deptIds = [...document.querySelectorAll('#modal .uD:checked')].map((x) => x.value);
    try {
      if (u) await api('/api/users/' + u.id, { method: 'PATCH', body: { name: $('#uName').value, role: $('#uRole').value, deptIds, active: $('#uActive').checked, password: $('#uPass').value || undefined } });
      else await api('/api/users', { method: 'POST', body: { name: $('#uName').value, username: $('#uUser').value, password: $('#uPass').value, role: $('#uRole').value, deptIds } });
      closeModal(); toast('تم الحفظ'); loadUsers();
    } catch (e) { toast(e.message, 4000); }
  };
}
$('#btnAddUser').addEventListener('click', () => userForm(null));

// ---------- الإعدادات ----------
async function renderSettings() {
  const s = O.settings, p = O.program, e = O.env;
  $('#pName').value = p.name || ''; $('#pYear').value = p.academicYear || ''; $('#pSemester').value = p.semester || ''; $('#pStart').value = p.startDate || '';
  $('#sKickoff').checked = s.kickoffEnabled; $('#sOffsets').value = s.reminderOffsetsDays.join(', '); $('#sThanks').checked = s.thanksEnabled; $('#sLate').checked = s.acknowledgeLate;
  $('#sOverdue').checked = s.overdueNoticeEnabled; $('#sReport').checked = s.reportToViceDean; $('#sCcVd').checked = s.ccViceDean; $('#sHour').value = s.sendHour;
  $('#sDays').innerHTML = DAYS.map((d, i) => `<label><input type="checkbox" data-day="${i}" ${s.sendDays.includes(i) ? 'checked' : ''}>${d}</label>`).join('');
  $('#cEmail').checked = s.channels.email; $('#cTeams').checked = s.channels.teams; $('#cWa').checked = s.channels.whatsapp;
  const tag = (el, ok, t) => { el.textContent = t; el.className = 'tag ' + (ok ? 'ok' : 'bad'); };
  tag($('#cEmailState'), e.emailConfigured, e.emailConfigured ? 'SMTP مُعد' : 'SMTP غير مُعد');
  tag($('#cTeamsState'), true, 'Webhook لكل قسم / رابط يدوي');
  tag($('#cWaState'), e.whatsappConfigured, e.whatsappConfigured ? `مُعد (${e.whatsappProvider})` : 'غير مُعد - روابط يدوية');
  const markers = await api('/api/markers');
  const keys = Object.keys(markers);
  $('#markersList').innerHTML = keys.length ? keys.map((k) => `<div class="marker"><span>${esc(k)} <small class="muted">${fmtTs(markers[k])}</small></span><button class="btn sm ghost" data-marker="${esc(k)}">حذف</button></div>`).join('') + `<div class="actions"><button class="btn sm danger" data-marker="*">حذف كل العلامات</button></div>` : '<span class="muted">لا توجد علامات إرسال بعد</span>';
  $('#markersList').onclick = async (ev) => { const b = ev.target.closest('[data-marker]'); if (!b || !confirm('حذف العلامة يعني إعادة إرسال الرسالة في الدورة القادمة. متابعة؟')) return; await api('/api/markers/reset', { method: 'POST', body: { marker: b.dataset.marker } }); renderSettings(); load(); };
}
$('#btnSaveProgram').addEventListener('click', async () => { try { await api('/api/program', { method: 'PUT', body: { name: $('#pName').value, academicYear: $('#pYear').value, semester: $('#pSemester').value, startDate: $('#pStart').value } }); toast('تم الحفظ'); load(); } catch (e) { toast(e.message); } });
$('#btnSaveSettings').addEventListener('click', async () => {
  const body = { kickoffEnabled: $('#sKickoff').checked, reminderOffsetsDays: $('#sOffsets').value.split(/[,،\s]+/).map(Number).filter((n) => n > 0), thanksEnabled: $('#sThanks').checked, acknowledgeLate: $('#sLate').checked, overdueNoticeEnabled: $('#sOverdue').checked, reportToViceDean: $('#sReport').checked, ccViceDean: $('#sCcVd').checked, sendHour: Number($('#sHour').value) || 8, sendDays: [...document.querySelectorAll('#sDays input:checked')].map((x) => Number(x.dataset.day)) };
  if (!body.reminderOffsetsDays.length) body.reminderOffsetsDays = [14];
  try { await api('/api/settings', { method: 'PUT', body }); toast('تم الحفظ'); load(); } catch (e) { toast(e.message); }
});
$('#btnSaveChannels').addEventListener('click', async () => { try { await api('/api/settings', { method: 'PUT', body: { channels: { email: $('#cEmail').checked, teams: $('#cTeams').checked, whatsapp: $('#cWa').checked } } }); toast('تم الحفظ'); load(); } catch (e) { toast(e.message); } });
$('#btnTest').addEventListener('click', async () => { $('#testResult').textContent = 'جاري الإرسال...'; try { const r = await api('/api/test-channels', { method: 'POST', body: { email: $('#tEmail').value, phone: $('#tPhone').value, teamsWebhook: $('#tTeams').value } }); $('#testResult').textContent = Object.entries(r).map(([k, v]) => `${CH[k]}: ${v}`).join('\n') || 'لم يُحدد أي مستلم'; } catch (e) { $('#testResult').textContent = e.message; } });
$('#btnImport').addEventListener('click', async () => {
  const f = $('#importFile').files[0]; if (!f) { toast('اختر ملف Excel أولاً'); return; }
  $('#importResult').textContent = 'جاري الاستيراد...';
  try { const buf = await f.arrayBuffer(); const r = await api('/api/import' + ($('#importReplace').checked ? '?replace=1' : ''), { method: 'POST', body: buf }); $('#importResult').textContent = `أقسام: ${r.departments} | وثائق: ${r.files} | تسليمات: ${r.submissions} | إعدادات: ${r.settings}` + (r.warnings.length ? '\nتنبيهات:\n- ' + r.warnings.join('\n- ') : ''); load(); } catch (e) { $('#importResult').textContent = 'فشل: ' + e.message; }
});

load().catch((e) => toast('تعذر تحميل البيانات: ' + e.message, 6000));
setInterval(() => { if (document.visibilityState === 'visible') load().catch(() => {}); }, 60000);
