/** الأنواع الأساسية لنظام متابعة ملفات الجودة */

export interface DepartmentHead {
  name: string;
  email: string;
  /** رقم الواتساب بالصيغة الدولية مثل 9665xxxxxxxx */
  phone?: string;
  /** بريد رئيس القسم في Teams (يُستخدم لروابط الدردشة المباشرة) */
  teamsEmail?: string;
  /** رابط Workflow Webhook خاص بمحادثة/قناة القسم في Teams */
  teamsWebhook?: string;
}

export interface Department {
  id: string;
  name: string;
  shortName?: string;
  head: DepartmentHead;
  /** نسخة إلى (منسق الجودة بالقسم مثلاً) */
  cc?: string[];
  active?: boolean;
}

export interface RequiredFile {
  id: string;
  /** رقم الوثيقة في جدول الوكالة مثل 2-7-1 (يُستخدم أيضاً لرصد التسليم من أسماء الملفات) */
  number?: string;
  name: string;
  /** المرحلة الزمنية (تجميع الوثائق ذات الموعد الواحد في رسالة واحدة) */
  phase?: string;
  /** مسؤولية التنفيذ */
  responsible?: string;
  description?: string;
  /** موعد التسليم النهائي YYYY-MM-DD */
  deadline: string;
  /** كلمات مفتاحية لرصد التسليم من البريد (عنوان الرسالة أو اسم المرفق) */
  keywords?: string[];
  /** الأقسام المعنية (فارغ = جميع الأقسام) */
  departments?: string[];
}

export interface ProgramInfo {
  name: string;
  academicYear?: string;
  semester?: string;
  /** تاريخ بداية العمل YYYY-MM-DD - تُرسل رسالة الانطلاق في هذا اليوم */
  startDate: string;
}

export interface Settings {
  /** إيقاف مؤقت لكل الإرسال التلقائي */
  paused: boolean;
  /** أيام التذكير قبل الموعد (الافتراضي أسبوعان) */
  reminderOffsetsDays: number[];
  channels: { email: boolean; teams: boolean; whatsapp: boolean };
  /** ساعة الإرسال اليومي (بتوقيت TZ_NAME) */
  sendHour: number;
  kickoffEnabled: boolean;
  thanksEnabled: boolean;
  /** إرسال إشعار استلام للملفات المسلّمة بعد الموعد */
  acknowledgeLate: boolean;
  /** إرسال تنبيه تأخر بعد انقضاء الموعد للأقسام غير المسلّمة */
  overdueNoticeEnabled: boolean;
  /** إرسال تقرير للوكيل يوم كل موعد تسليم */
  reportToViceDean: boolean;
  /** إضافة بريد الوكيل نسخة CC على رسائل الأقسام */
  ccViceDean: boolean;
  /** الأيام التي يُسمح فيها بالإرسال (0=الأحد ... 6=السبت) */
  sendDays: number[];
}

export interface Config {
  program: ProgramInfo;
  departments: Department[];
  files: RequiredFile[];
  settings: Settings;
}

export type MessageKind = 'kickoff' | 'reminder' | 'thanks' | 'late_ack' | 'overdue' | 'report' | 'manual';
export type Channel = 'email' | 'teams' | 'whatsapp';
export type MessageStatus = 'sent' | 'failed' | 'dry_run' | 'manual_pending' | 'skipped';

export interface Submission {
  id: string;
  deptId: string;
  fileId: string;
  /** تاريخ التسليم YYYY-MM-DD */
  submittedAt: string;
  source: 'manual' | 'email';
  note?: string;
  evidence?: string;
  reviewStatus: 'pending' | 'reviewed' | 'needs_changes';
  thanksSentAt?: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  at: string;
  kind: MessageKind;
  channel: Channel;
  deptId?: string;
  /** الموعد النهائي الذي تخصه الرسالة (مجموعة الوثائق) */
  deadline?: string;
  fileIds?: string[];
  to: string;
  subject?: string;
  body: string;
  status: MessageStatus;
  error?: string;
  /** رابط للإرسال اليدوي (wa.me أو Teams deep link) عند تعذر الإرسال التلقائي */
  manualLink?: string;
}

export interface InboxItem {
  id: string;
  at: string;
  from: string;
  subject: string;
  attachments: string[];
  deptId?: string;
  matchedFileIds?: string[];
  messageId?: string;
  handled: boolean;
}

export interface State {
  /** علامات الأحداث المرسلة لمنع التكرار مثل kickoff / reminder:F1:14:D1 */
  sentMarkers: Record<string, string>;
  submissions: Submission[];
  messages: MessageLog[];
  inbox: InboxItem[];
  lastTickAt?: string;
  lastInboxCheckAt?: string;
}

export interface Templates {
  kickoff: { subject: string; body: string };
  reminder: { subject: string; body: string };
  thanks: { subject: string; body: string };
  late_ack: { subject: string; body: string };
  overdue: { subject: string; body: string };
  report: { subject: string; body: string };
  signature: string;
}

/** رسالة مخططة ناتجة عن محرك الأتمتة قبل الإرسال */
export interface PlannedMessage {
  kind: MessageKind;
  deptId?: string;
  deadline?: string;
  fileIds?: string[];
  /** المفتاح الذي يُسجَّل بعد الإرسال لمنع التكرار */
  marker?: string;
  subject: string;
  body: string;
  recipients: {
    email?: string;
    cc?: string[];
    phone?: string;
    teamsWebhook?: string;
    teamsEmail?: string;
  };
}
