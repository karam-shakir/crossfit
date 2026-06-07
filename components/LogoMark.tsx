'use client';
import React from 'react';

/**
 * LogoMark — شعار مجموعة المطانيخ CrossFit
 *
 * شعار احترافي يجمع:
 * - حرف م العربي بأسلوب lettermark واضح
 * - حديد CrossFit المميز
 * - إطار وشكل سداسي يعبّر عن القوة
 */

// ── الشارة الرئيسية: سداسية مع حديد وحرف م ──────────────────────────────
export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ── خلفية دائرية داكنة ── */}
      <circle cx="60" cy="60" r="58" fill="#0f172a"/>

      {/* ── الإطار الخارجي البرتقالي (سميك) ── */}
      <circle cx="60" cy="60" r="58" fill="none" stroke="#f97316" strokeWidth="4"/>

      {/* ── خط داخلي رفيع ── */}
      <circle cx="60" cy="60" r="51" fill="none" stroke="#f97316" strokeWidth="0.8" opacity="0.3"/>

      {/* ══ الحديد (Barbell) ══ */}
      {/* Left outer plate */}
      <rect x="5"  y="47" width="14" height="26" rx="4" fill="#f97316"/>
      {/* Left inner plate */}
      <rect x="19" y="51" width="9"  height="18" rx="2.5" fill="#fb923c"/>
      {/* Bar */}
      <rect x="28" y="57" width="64" height="6"  rx="3" fill="#fdba74"/>
      {/* Right inner plate */}
      <rect x="92" y="51" width="9"  height="18" rx="2.5" fill="#fb923c"/>
      {/* Right outer plate */}
      <rect x="101" y="47" width="14" height="26" rx="4" fill="#f97316"/>

      {/* ══ حرف م (Meem) بأسلوب Geometric Bold ══ */}
      {/* الجزء العلوي الأفقي من م */}
      <rect x="36" y="22" width="48" height="9" rx="4.5" fill="#ffffff"/>
      {/* العمود الأيمن من م */}
      <rect x="74" y="22" width="10" height="28" rx="3" fill="#ffffff"/>
      {/* القوس السفلي من م (الذنب) */}
      <path
        d="M36,31 L36,38 Q36,50 48,50 Q60,50 60,40 L60,35 L70,35 L70,38 Q70,42 74,42"
        fill="none"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ══ خطوط الطاقة (sparks) ══ */}
      <line x1="60" y1="4"  x2="60" y2="13" stroke="#fbbf24" strokeWidth="3"   strokeLinecap="round"/>
      <line x1="46" y1="6"  x2="49" y2="14" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" opacity="0.75"/>
      <line x1="74" y1="6"  x2="71" y2="14" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" opacity="0.75"/>
      <line x1="35" y1="10" x2="40" y2="16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <line x1="85" y1="10" x2="80" y2="16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>

      {/* ══ نص CROSSFIT في الأسفل ══ */}
      <line x1="22" y1="86" x2="98" y2="86" stroke="#f97316" strokeWidth="0.8" opacity="0.5"/>
      <text
        x="60" y="101"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="#f97316"
        fontFamily="'Segoe UI', Arial, sans-serif"
        letterSpacing="3.5"
      >CROSSFIT</text>
    </svg>
  );
}

// ── الشعار الكامل (صفحة الدخول) ──────────────────────────────────────────
export function FullLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

      {/* الشارة */}
      <div style={{ position: 'relative' }}>
        {/* توهج خلفي */}
        <div style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <LogoMark size={130}/>
      </div>

      {/* الاسم العربي */}
      <div style={{ textAlign: 'center' }}>
        {/* اسم المنصة */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <DiamondStar color="#f97316" size={10}/>
          <span style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            lineHeight: 1,
          }}>المطانيخ</span>
          <DiamondStar color="#f97316" size={10}/>
        </div>

        {/* خط فاصل */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '6px',
        }}>
          <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, #f97316, transparent)' }}/>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }}/>
          <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, #f97316, transparent)' }}/>
        </div>

        {/* العنوان الفرعي */}
        <div style={{
          fontSize: '11px',
          color: '#f97316',
          letterSpacing: '5px',
          fontWeight: '700',
          textTransform: 'uppercase',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          opacity: 0.9,
        }}>CrossFit Group</div>
      </div>
    </div>
  );
}

// ── الشعار المضغوط (Navbar) ───────────────────────────────────────────────
export function NavbarLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <LogoMark size={48}/>
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '800',
          color: '#ffffff',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          letterSpacing: '-0.2px',
        }}>المطانيخ</div>
        <div style={{
          fontSize: '7.5px',
          color: '#f97316',
          letterSpacing: '2.5px',
          fontWeight: '700',
          textTransform: 'uppercase',
          marginTop: '3px',
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}>CrossFit</div>
      </div>
    </div>
  );
}

// ── نجمة زخرفية ماسية ────────────────────────────────────────────────────
function DiamondStar({ color = '#f97316', size = 10 }: { color?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill={color}
      style={{ flexShrink: 0 }}
    >
      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"/>
    </svg>
  );
}
