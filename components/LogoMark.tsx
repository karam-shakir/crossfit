'use client';
import React from 'react';

/**
 * LogoMark — شعار المطانيخ CrossFit
 *
 * شارة سداسية تحتوي على:
 * - حرف م (أول حرف المطانيخ) في الأعلى
 * - حديد CrossFit في المنتصف
 * - نص CROSSFIT في الأسفل
 * - خطوط طاقة وحماس
 */
export function LogoMark({ size = 60 }: { size?: number }) {
  const h = Math.round(size * 96 / 100);
  return (
    <svg
      viewBox="0 0 100 96"
      width={size}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ── Outer hexagon (orange) ── */}
      <path
        d="M50,2 L90,25 L90,71 L50,94 L10,71 L10,25 Z"
        fill="#f97316"
      />

      {/* ── Inner hexagon (dark) ── */}
      <path
        d="M50,10 L82,28 L82,68 L50,86 L18,68 L18,28 Z"
        fill="#0f172a"
      />

      {/* ── Orange accent line (top inside) ── */}
      <line x1="32" y1="28" x2="68" y2="28" stroke="#f97316" strokeWidth="1" opacity="0.35"/>

      {/* ── Arabic letter م ── */}
      <text
        x="50" y="38"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill="#ffffff"
        fontFamily="'Segoe UI', 'Arial', sans-serif"
        letterSpacing="0"
      >م</text>

      {/* ── Energy sparks above م ── */}
      <line x1="50" y1="13" x2="50" y2="19" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="41" y1="15" x2="44" y2="20" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
      <line x1="59" y1="15" x2="56" y2="20" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>

      {/* ── Barbell ── */}
      {/* Left outer plate */}
      <rect x="18" y="42" width="10" height="20" rx="2.5" fill="#f97316"/>
      {/* Left inner plate */}
      <rect x="28" y="45" width="7"  height="14" rx="2"   fill="#fb923c"/>
      {/* Bar */}
      <rect x="35" y="49" width="30" height="5"  rx="2.5" fill="#fdba74"/>
      {/* Right inner plate */}
      <rect x="65" y="45" width="7"  height="14" rx="2"   fill="#fb923c"/>
      {/* Right outer plate */}
      <rect x="72" y="42" width="10" height="20" rx="2.5" fill="#f97316"/>

      {/* ── Separator line ── */}
      <line x1="28" y1="68" x2="72" y2="68" stroke="#f97316" strokeWidth="0.8" opacity="0.45"/>

      {/* ── CROSSFIT text ── */}
      <text
        x="50" y="79"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fill="#f97316"
        fontFamily="'Segoe UI', 'Arial', sans-serif"
        letterSpacing="2.2"
      >CROSSFIT</text>
    </svg>
  );
}

/**
 * FullLogo — الشعار الكامل مع النص (لصفحة الدخول)
 */
export function FullLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      {/* Badge */}
      <LogoMark size={110}/>

      {/* Arabic name */}
      <div style={{ textAlign: 'center', lineHeight: 1 }}>
        {/* Decorative stars */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          marginBottom: '6px',
        }}>
          <StarDecor/>
          <span style={{
            fontSize: '28px', fontWeight: '900', color: '#ffffff',
            letterSpacing: '-0.5px', fontFamily: "'Segoe UI', 'Arial', sans-serif",
          }}>المطانيخ</span>
          <StarDecor/>
        </div>

        {/* English subtitle */}
        <div style={{
          fontSize: '10px', color: '#f97316', letterSpacing: '4px',
          fontWeight: '600', textTransform: 'uppercase',
          fontFamily: "'Segoe UI', 'Arial', sans-serif",
        }}>CrossFit Group</div>
      </div>
    </div>
  );
}

/**
 * NavbarLogo — الشعار المضغوط للقائمة الجانبية
 */
export function NavbarLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <LogoMark size={42}/>
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontSize: '15px', fontWeight: '800', color: '#ffffff',
          fontFamily: "'Segoe UI', 'Arial', sans-serif",
        }}>المطانيخ</div>
        <div style={{
          fontSize: '7px', color: '#f97316', letterSpacing: '2px',
          fontWeight: '700', textTransform: 'uppercase', marginTop: '2px',
          fontFamily: "'Segoe UI', 'Arial', sans-serif",
        }}>CrossFit</div>
      </div>
    </div>
  );
}

/** ✦ نجمة زخرفية صغيرة */
function StarDecor() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="#f97316" style={{ flexShrink: 0 }}>
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z"/>
    </svg>
  );
}
