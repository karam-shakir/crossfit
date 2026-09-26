import { getMemberById } from './db';

type SessionLike = { id: string; role: string } | null;

/**
 * صلاحية "شبه إدارية" محدودة بتوليد/حفظ تمارين الكروسفت فقط —
 * لا تمنح وصولاً لإدارة الأعضاء أو الصلاحيات أو الرياضات الأخرى.
 * المدير الكامل (role === 'admin') يملكها دائماً؛ عضو عادي يملكها
 * فقط إذا فعّلها المدير له صراحة عبر canGenerateWod.
 */
export async function canManageCrossfitWod(session: SessionLike): Promise<boolean> {
  if (!session) return false;
  if (session.role === 'admin') return true;
  const member = await getMemberById(session.id);
  return member?.canGenerateWod === true;
}

/**
 * صلاحية "شبه إدارية" محدودة بتوليد/حفظ برنامج الجيم فقط —
 * لا تمنح وصولاً لخطة الرياضات، العدّائين، الكاليسثنكس، إدارة الأعضاء، أو سجل الدخول.
 * المدير الكامل (role === 'admin') يملكها دائماً؛ عضو عادي يملكها
 * فقط إذا فعّلها المدير له صراحة عبر canGenerateGym.
 */
export async function canManageGym(session: SessionLike): Promise<boolean> {
  if (!session) return false;
  if (session.role === 'admin') return true;
  const member = await getMemberById(session.id);
  return member?.canGenerateGym === true;
}
