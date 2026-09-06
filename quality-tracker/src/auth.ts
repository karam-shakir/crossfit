/**
 * المستخدمون والصلاحيات
 * الأدوار: admin (مدير النظام - كل شيء) | editor (متابع - تسجيل التسليم والإرسال) | viewer (مشاهد - قراءة فقط)
 * يمكن تقييد أي مستخدم بأقسام محددة (deptIds) فلا يرى سوى بياناتها.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type express from 'express';
import { env } from './config.ts';

export type Role = 'admin' | 'editor' | 'viewer';
export const ROLE_RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 };
export const ROLE_AR: Record<Role, string> = { admin: 'مدير النظام', editor: 'متابع', viewer: 'مشاهد' };

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  /** فارغ = كل الأقسام */
  deptIds?: string[];
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

const USERS_FILE = () => path.join(env.dataDir, 'users.json');
const SECRET_FILE = () => path.join(env.dataDir, '.session-secret');

function readUsers(): User[] {
  const p = USERS_FILE();
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8')) as User[];
}
function writeUsers(users: User[]) {
  fs.mkdirSync(env.dataDir, { recursive: true });
  fs.writeFileSync(USERS_FILE(), JSON.stringify(users, null, 2), 'utf8');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [, salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 64);
  const given = Buffer.from(hash, 'hex');
  return calc.length === given.length && crypto.timingSafeEqual(calc, given);
}

let secret: string | null = null;
function sessionSecret(): string {
  if (secret) return secret;
  if (process.env.SESSION_SECRET) return (secret = process.env.SESSION_SECRET);
  const p = SECRET_FILE();
  if (fs.existsSync(p)) return (secret = fs.readFileSync(p, 'utf8').trim());
  fs.mkdirSync(env.dataDir, { recursive: true });
  secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(p, secret, 'utf8');
  return secret;
}

const publicUser = (u: User): PublicUser => { const { passwordHash: _p, ...rest } = u; return rest; };

/** إنشاء مستخدم المدير الافتراضي عند أول تشغيل إذا لم يوجد مستخدمون */
export function ensureDefaultAdmin(): { created: boolean; username: string } {
  const users = readUsers();
  if (users.length) return { created: false, username: '' };
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || env.dashboardPassword || 'admin123';
  writeUsers([{ id: 'u_admin', name: 'مدير النظام', username, passwordHash: hashPassword(password), role: 'admin', active: true, createdAt: new Date().toISOString() }]);
  return { created: true, username };
}

export function listUsers(): PublicUser[] {
  return readUsers().map(publicUser);
}

export function createUser(input: { name: string; username: string; password: string; role: Role; deptIds?: string[] }): PublicUser {
  const users = readUsers();
  const username = input.username.trim().toLowerCase();
  if (!username || !input.password || !input.name) throw new Error('الاسم واسم المستخدم وكلمة المرور مطلوبة');
  if (input.password.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  if (users.some((u) => u.username === username)) throw new Error('اسم المستخدم مستخدم مسبقاً');
  if (!ROLE_RANK[input.role]) throw new Error('دور غير صالح');
  const u: User = { id: 'u_' + crypto.randomBytes(5).toString('hex'), name: input.name.trim(), username, passwordHash: hashPassword(input.password), role: input.role, deptIds: input.deptIds?.length ? input.deptIds : undefined, active: true, createdAt: new Date().toISOString() };
  users.push(u); writeUsers(users);
  return publicUser(u);
}

export function updateUser(id: string, patch: { name?: string; role?: Role; deptIds?: string[]; active?: boolean; password?: string }, actor: PublicUser): PublicUser {
  const users = readUsers();
  const u = users.find((x) => x.id === id);
  if (!u) throw new Error('المستخدم غير موجود');
  if (patch.role && !ROLE_RANK[patch.role]) throw new Error('دور غير صالح');
  const admins = users.filter((x) => x.role === 'admin' && x.active);
  if (u.role === 'admin' && admins.length === 1 && ((patch.role && patch.role !== 'admin') || patch.active === false)) throw new Error('لا يمكن إزالة آخر مدير للنظام');
  if (patch.name !== undefined) u.name = patch.name.trim() || u.name;
  if (patch.role !== undefined) u.role = patch.role;
  if (patch.deptIds !== undefined) u.deptIds = patch.deptIds.length ? patch.deptIds : undefined;
  if (patch.active !== undefined && u.id !== actor.id) u.active = patch.active;
  if (patch.password) { if (patch.password.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); u.passwordHash = hashPassword(patch.password); }
  writeUsers(users);
  return publicUser(u);
}

export function deleteUser(id: string, actor: PublicUser) {
  const users = readUsers();
  const u = users.find((x) => x.id === id);
  if (!u) throw new Error('المستخدم غير موجود');
  if (u.id === actor.id) throw new Error('لا يمكنك حذف حسابك الحالي');
  if (u.role === 'admin' && users.filter((x) => x.role === 'admin' && x.active).length === 1) throw new Error('لا يمكن حذف آخر مدير للنظام');
  writeUsers(users.filter((x) => x.id !== id));
}

export function changeOwnPassword(id: string, current: string, next: string) {
  const users = readUsers();
  const u = users.find((x) => x.id === id);
  if (!u || !verifyPassword(current, u.passwordHash)) throw new Error('كلمة المرور الحالية غير صحيحة');
  if (next.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  u.passwordHash = hashPassword(next); writeUsers(users);
}

// ---------- الجلسات (كوكي موقّع) ----------
const COOKIE = 'qt_session';
const SESSION_DAYS = 14;

function sign(payload: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}
export function issueToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 86_400_000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
function parseToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data.uid : null;
  } catch { return null; }
}
function readCookie(req: express.Request): string | undefined {
  const raw = req.headers.cookie || '';
  const m = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(COOKIE + '='));
  return m ? decodeURIComponent(m.slice(COOKIE.length + 1)) : undefined;
}

export function login(username: string, password: string): { user: PublicUser; token: string } {
  const users = readUsers();
  const u = users.find((x) => x.username === String(username || '').trim().toLowerCase());
  if (!u || !u.active || !verifyPassword(String(password || ''), u.passwordHash)) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  u.lastLoginAt = new Date().toISOString(); writeUsers(users);
  return { user: publicUser(u), token: issueToken(u.id) };
}

export function setSessionCookie(res: express.Response, token: string) {
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`);
}
export function clearSessionCookie(res: express.Response) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

declare global { namespace Express { interface Request { user?: PublicUser } } }

/** يضع req.user إن وُجدت جلسة صالحة */
export function attachUser(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const uid = parseToken(readCookie(req));
  if (uid) {
    const u = readUsers().find((x) => x.id === uid && x.active);
    if (u) req.user = publicUser(u);
  }
  next();
}

export function requireRole(min: Role) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'يلزم تسجيل الدخول', login: true });
    if (ROLE_RANK[req.user.role] < ROLE_RANK[min]) return res.status(403).json({ error: `هذه العملية تتطلب صلاحية "${ROLE_AR[min]}"` });
    next();
  };
}

/** هل يحق للمستخدم رؤية هذا القسم؟ */
export function canSeeDept(user: PublicUser | undefined, deptId: string | undefined): boolean {
  if (!user) return false;
  if (!user.deptIds?.length) return true;
  return !deptId || user.deptIds.includes(deptId);
}
