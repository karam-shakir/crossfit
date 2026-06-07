'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// ===== SVG Icon Components =====
function IcHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/>
      <path d="M9 21V13h6v8"/>
    </svg>
  );
}
function IcLogbook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      <line x1="9" y1="7" x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
    </svg>
  );
}
function IcTrophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4H3v3a4 4 0 004 4m10-7h4v3a4 4 0 01-4 4"/>
      <path d="M7 4h10v7a5 5 0 01-10 0V4z"/>
      <line x1="12" y1="16" x2="12" y2="20"/>
      <line x1="8" y1="20" x2="16" y2="20"/>
    </svg>
  );
}
function IcTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IcCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="2.5"/>
      <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5"/>
      <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="2.5"/>
    </svg>
  );
}
function IcRun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="4" r="1.5"/>
      <path d="M6 20l3.5-5.5 2.5 3 3-4.5L17 17"/>
      <path d="M14 7l-2.5 3.5L8 9l-2 4"/>
      <path d="M14 7l3 1.5"/>
    </svg>
  );
}
function IcKettlebell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 8a3.5 3.5 0 117 0"/>
      <path d="M7 8h10l1.5 2.5A6 6 0 115.5 8"/>
      <path d="M7 8l-1.5 2.5A6 6 0 108.5 8"/>
    </svg>
  );
}
function IcRuler({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20.5L20.5 2"/>
      <path d="M6.5 18l1.5-1.5M10 14.5l1.5-1.5M13.5 11l1.5-1.5M17 7.5l1.5-1.5"/>
      <path d="M5 19.5l-1 1M8.5 16l-1 1M12 12.5l-1 1M15.5 9l-1 1M19 5.5l-1 1"/>
    </svg>
  );
}
function IcBarChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1"/>
      <rect x="10" y="7" width="4" height="14" rx="1"/>
      <rect x="17" y="3" width="4" height="18" rx="1"/>
    </svg>
  );
}
function IcPodium({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="14" width="6" height="8" rx="1"/>
      <rect x="9" y="9" width="6" height="13" rx="1"/>
      <rect x="17" y="11" width="6" height="11" rx="1"/>
      <path d="M12 4l.8 2.5H15l-2 1.5.8 2.5L12 9l-1.8 1.5.8-2.5-2-1.5h2.2L12 4z" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IcCheckCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <polyline points="7.5 15.5 10 18 16.5 13"/>
    </svg>
  );
}
function IcUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function IcSliders({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IcLogout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H4a2 2 0 01-2-2V5a2 2 0 012-2h5"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IcMore({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IcUserShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l7 3v5c0 4.5-3 8.5-7 10C5 18.5 2 14.5 2 10V5l7-3z"/>
      <circle cx="12" cy="9" r="2.5"/>
      <path d="M7.5 17.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/>
    </svg>
  );
}

// ===== Barbell Logo SVG =====
function BarbellLogo() {
  return (
    <svg viewBox="0 0 48 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-5 flex-shrink-0">
      {/* Left outer plate */}
      <rect x="0" y="4" width="5" height="14" rx="1.5" fill="#f97316"/>
      {/* Left inner plate */}
      <rect x="6" y="7" width="3.5" height="8" rx="1" fill="#fb923c"/>
      {/* Bar */}
      <rect x="9.5" y="10" width="29" height="2" rx="1" fill="#fdba74"/>
      {/* Right inner plate */}
      <rect x="38.5" y="7" width="3.5" height="8" rx="1" fill="#fb923c"/>
      {/* Right outer plate */}
      <rect x="43" y="4" width="5" height="14" rx="1.5" fill="#f97316"/>
    </svg>
  );
}

// ===== Nav Link Data =====
type NavItem = { href: string; label: string; iconKey: string };

const mainLinks: NavItem[] = [
  { href: '/dashboard',    label: 'الرئيسية',   iconKey: 'home'      },
  { href: '/logbook',      label: 'السجل',       iconKey: 'logbook'   },
  { href: '/prs',          label: 'أرقامي',      iconKey: 'trophy'    },
  { href: '/skills',       label: 'المهارات',    iconKey: 'target'    },
  { href: '/wod-history',  label: 'تاريخ WODs',  iconKey: 'calendar'  },
  { href: '/hyrox',        label: 'Hyrox',       iconKey: 'run'       },
  { href: '/kettlebell',   label: 'Kettlebell',  iconKey: 'kettlebell'},
  { href: '/measurements', label: 'القياسات',    iconKey: 'ruler'     },
  { href: '/benchmarks',   label: 'البنشمارك',   iconKey: 'barchart'  },
  { href: '/leaderboard',  label: 'الترتيب',     iconKey: 'podium'    },
  { href: '/attendance',   label: 'الحضور',      iconKey: 'checkcal'  },
  { href: '/profile',      label: 'ملفي',        iconKey: 'user'      },
];

function NavIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const cls = className || 'w-4 h-4 flex-shrink-0';
  switch (iconKey) {
    case 'home':       return <IcHome className={cls}/>;
    case 'logbook':    return <IcLogbook className={cls}/>;
    case 'trophy':     return <IcTrophy className={cls}/>;
    case 'target':     return <IcTarget className={cls}/>;
    case 'calendar':   return <IcCalendar className={cls}/>;
    case 'run':        return <IcRun className={cls}/>;
    case 'kettlebell': return <IcKettlebell className={cls}/>;
    case 'ruler':      return <IcRuler className={cls}/>;
    case 'barchart':   return <IcBarChart className={cls}/>;
    case 'podium':     return <IcPodium className={cls}/>;
    case 'checkcal':   return <IcCheckCalendar className={cls}/>;
    case 'user':       return <IcUser className={cls}/>;
    case 'sliders':    return <IcSliders className={cls}/>;
    case 'logout':     return <IcLogout className={cls}/>;
    case 'more':       return <IcMore className={cls}/>;
    case 'usershield': return <IcUserShield className={cls}/>;
    default:           return <IcHome className={cls}/>;
  }
}

// ===== Link Color Theme =====
function linkColor(href: string) {
  if (href === '/hyrox')      return 'red';
  if (href === '/kettlebell') return 'amber';
  return undefined;
}

// ===== Nav Link Component =====
function NavLink({ href, iconKey, label, active, color }: {
  href: string; iconKey: string; label: string; active: boolean; color?: string;
}) {
  const base = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 w-full';

  let activeClass = 'bg-orange-500 text-white shadow-sm';
  let inactiveClass = 'text-gray-400 hover:bg-gray-800 hover:text-white';
  if (color === 'red') {
    activeClass   = 'bg-red-600 text-white shadow-sm';
    inactiveClass = 'text-red-400 hover:bg-gray-800 hover:text-red-300';
  } else if (color === 'amber') {
    activeClass   = 'bg-amber-600 text-white shadow-sm';
    inactiveClass = 'text-amber-400 hover:bg-gray-800 hover:text-amber-300';
  }

  return (
    <Link href={href} className={`${base} ${active ? activeClass : inactiveClass}`}>
      <NavIcon iconKey={iconKey} className="w-4 h-4 flex-shrink-0"/>
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ===== Initials Avatar =====
function Avatar({ name, role }: { name: string; role: string }) {
  const initials = name?.trim().slice(0, 1) || 'U';
  const bg = role === 'admin' ? 'bg-purple-600' : 'bg-orange-500';
  return (
    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold text-sm">{initials}</span>
    </div>
  );
}

// ===== Main Navbar Component =====
export default function Navbar({ member }: {
  member: { nameAr: string; role: string; avatar?: string; canViewWods?: boolean; canGenerateWod?: boolean }
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  const isAdmin = member.role === 'admin';

  const allowedLinks = mainLinks.filter(l => {
    if (l.href === '/wod-history' && !isAdmin && member.canViewWods === false) return false;
    return true;
  });

  const mobileBottomFiltered = allowedLinks.slice(0, 5);
  const mobileMoreFiltered   = allowedLinks.slice(5);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 border-l border-gray-800 min-h-screen fixed right-0 top-0 z-40">

        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BarbellLogo />
            <div>
              <div className="text-sm font-bold text-white leading-tight tracking-wide">المطانيخ</div>
              <div className="text-xs text-orange-400 font-medium tracking-wider uppercase">CrossFit</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-3 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-3 py-2.5">
            <Avatar name={member.nameAr} role={member.role}/>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{member.nameAr}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                {isAdmin
                  ? <><IcUserShield className="w-3 h-3 text-purple-400"/><span className="text-purple-400">مدير النظام</span></>
                  : <><IcUser className="w-3 h-3 text-gray-500"/><span>عضو</span></>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2 overflow-y-auto flex flex-col gap-0.5">
          {allowedLinks.map(l => (
            <NavLink
              key={l.href}
              href={l.href}
              iconKey={l.iconKey}
              label={l.label}
              active={pathname === l.href}
              color={linkColor(l.href)}
            />
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-gray-800 my-1.5 mx-1"/>
              <Link href="/admin"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  pathname === '/admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <IcSliders className="w-4 h-4 flex-shrink-0"/>
                <span>لوحة التحكم</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-800 flex-shrink-0">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-300 transition-all">
            <IcLogout className="w-4 h-4 flex-shrink-0"/>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ===== Mobile Bottom Bar ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 flex safe-area-pb">
        {mobileBottomFiltered.map(l => {
          const isActive = pathname === l.href;
          const col = linkColor(l.href);
          const activeColor = col === 'red' ? '#ef4444' : col === 'amber' ? '#d97706' : '#f97316';
          return (
            <Link key={l.href} href={l.href}
              className="flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors"
              style={{ color: isActive ? activeColor : '#6b7280' }}>
              <NavIcon iconKey={l.iconKey} className="w-5 h-5"/>
              <span style={{ fontSize: '9px', lineHeight: 1 }}>{l.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(!open)}
          className="flex-1 flex flex-col items-center py-2.5 gap-1"
          style={{ color: open ? '#f97316' : '#6b7280' }}>
          <IcMore className="w-5 h-5"/>
          <span style={{ fontSize: '9px', lineHeight: 1 }}>المزيد</span>
        </button>
      </nav>

      {/* ===== Mobile More Menu ===== */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 shadow-2xl"
            style={{ bottom: '56px' }}
            onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-2">
              {mobileMoreFiltered.map(l => {
                const col = linkColor(l.href);
                const isActive = pathname === l.href;
                let activeCls = 'bg-orange-500 text-white';
                let inactiveCls = 'text-gray-300 bg-gray-800 hover:bg-gray-700';
                if (col === 'red')   { activeCls = 'bg-red-600 text-white';   inactiveCls = 'text-red-300 bg-gray-800 hover:bg-gray-700'; }
                if (col === 'amber') { activeCls = 'bg-amber-600 text-white'; inactiveCls = 'text-amber-300 bg-gray-800 hover:bg-gray-700'; }
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? activeCls : inactiveCls}`}>
                    <NavIcon iconKey={l.iconKey} className="w-4 h-4 flex-shrink-0"/>
                    <span>{l.label}</span>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm col-span-2 transition-colors ${
                    pathname === '/admin' ? 'bg-purple-600 text-white' : 'text-purple-300 bg-gray-800 hover:bg-gray-700'
                  }`}>
                  <IcSliders className="w-4 h-4 flex-shrink-0"/>
                  <span>لوحة التحكم</span>
                </Link>
              )}
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 bg-gray-800 hover:bg-gray-700 mt-2 transition-colors">
              <IcLogout className="w-4 h-4 flex-shrink-0"/>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
