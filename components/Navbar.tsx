'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const mainLinks = [
  { href: '/dashboard',    label: 'الرئيسية',   icon: '🏠' },
  { href: '/logbook',      label: 'السجل',       icon: '📓' },
  { href: '/prs',          label: 'أرقامي',      icon: '🏆' },
  { href: '/skills',       label: 'المهارات',    icon: '🎯' },
  { href: '/wod-history',  label: 'تاريخ WODs',  icon: '📚' },
  { href: '/hyrox',        label: 'Hyrox',       icon: '🏁' },
  { href: '/kettlebell',   label: 'Kettlebell',  icon: '🏋️' },
  { href: '/measurements', label: 'القياسات',    icon: '📏' },
  { href: '/benchmarks',   label: 'البنشمارك',   icon: '📊' },
  { href: '/leaderboard',  label: 'الترتيب',     icon: '🥇' },
  { href: '/attendance',   label: 'الحضور',      icon: '📅' },
  { href: '/profile',      label: 'ملفي',        icon: '👤' },
];

// أول 5 روابط في شريط الجوال السفلي
const mobileBottom = mainLinks.slice(0, 5);
// باقي الروابط في قائمة "المزيد"
const mobileMore = mainLinks.slice(5);

function NavLink({ href, icon, label, active, color }: {
  href: string; icon: string; label: string; active: boolean; color?: string;
}) {
  const base = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full';
  const activeClass = color === 'red' ? 'bg-red-600 text-white'
    : color === 'yellow' ? 'bg-yellow-600 text-white'
    : 'bg-orange-500 text-white';
  const inactiveClass = color === 'red' ? 'text-red-400 hover:bg-gray-800 hover:text-red-300'
    : color === 'yellow' ? 'text-yellow-400 hover:bg-gray-800 hover:text-yellow-300'
    : 'text-gray-400 hover:bg-gray-800 hover:text-white';
  return (
    <Link href={href} className={`${base} ${active ? activeClass : inactiveClass}`}>
      <span className="text-base flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      {(color === 'red' || color === 'yellow') && !active && (
        <span className="mr-auto text-xs bg-gray-700 px-1.5 py-0.5 rounded-full opacity-60 flex-shrink-0">AI</span>
      )}
    </Link>
  );
}

export default function Navbar({ member }: { member: { nameAr: string; role: string; avatar?: string; canViewWods?: boolean; canGenerateWod?: boolean } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // فلترة الروابط حسب صلاحيات العضو
  const isAdmin = member.role === 'admin';
  const allowedLinks = mainLinks.filter(l => {
    if (l.href === '/wod-history' && !isAdmin && member.canViewWods === false) return false;
    return true;
  });
  const mobileBottomFiltered = allowedLinks.slice(0, 5);
  const mobileMoreFiltered = allowedLinks.slice(5);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  function linkColor(href: string) {
    if (href === '/hyrox') return 'red';
    if (href === '/kettlebell') return 'yellow';
    return undefined;
  }

  return (
    <>
      {/* ===== الشريط الجانبي — الكمبيوتر ===== */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 border-l border-gray-800 min-h-screen fixed right-0 top-0 z-40">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="text-lg font-bold text-orange-400">المطانيخ 💪</div>
          <div className="text-xs text-gray-400 mt-1">CrossFit Group</div>
        </div>

        {/* User */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
          <span className="text-2xl flex-shrink-0">{member.avatar || '🏋️'}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{member.nameAr}</div>
            <div className="text-xs text-gray-500">{member.role === 'admin' ? '👑 المدير' : '🏋️ عضو'}</div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-2 overflow-y-auto flex flex-col gap-0.5">
          {allowedLinks.map(l => (
            <NavLink
              key={l.href}
              href={l.href}
              icon={l.icon}
              label={l.label}
              active={pathname === l.href}
              color={linkColor(l.href)}
            />
          ))}

          {member.role === 'admin' && (
            <>
              <div className="border-t border-gray-800 my-1" />
              <Link href="/admin"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === '/admin' ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <span className="text-base flex-shrink-0">⚙️</span>
                <span>الإدارة</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-800 flex-shrink-0">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-900 hover:text-red-300 transition-colors">
            <span className="flex-shrink-0">🚪</span>
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* ===== شريط الجوال السفلي ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 flex">
        {mobileBottomFiltered.map(l => (
          <Link key={l.href} href={l.href}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
            style={{ color: pathname === l.href ? '#f97316' : '#6b7280' }}>
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{l.icon}</span>
            <span style={{ fontSize: '9px', marginTop: '2px' }}>{l.label}</span>
          </Link>
        ))}
        <button onClick={() => setOpen(!open)}
          className="flex-1 flex flex-col items-center py-2 gap-0.5 text-gray-500">
          <span style={{ fontSize: '20px', lineHeight: 1 }}>⋯</span>
          <span style={{ fontSize: '9px', marginTop: '2px' }}>المزيد</span>
        </button>
      </nav>

      {/* ===== قائمة "المزيد" — الجوال ===== */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 right-0 bg-gray-900 border-t border-gray-800 p-3"
            style={{ bottom: '56px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {mobileMoreFiltered.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    pathname === l.href ? 'bg-orange-500 text-white' : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
                  }`}>
                  <span>{l.icon}</span><span>{l.label}</span>
                </Link>
              ))}
              {member.role === 'admin' && (
                <Link href="/admin" onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm col-span-2 transition-colors ${
                    pathname === '/admin' ? 'bg-purple-600 text-white' : 'text-purple-400 bg-gray-800 hover:bg-gray-700'
                  }`}>
                  <span>⚙️</span><span>الإدارة</span>
                </Link>
              )}
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 bg-gray-800 hover:bg-gray-700 mt-2">
              <span>🚪</span><span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
