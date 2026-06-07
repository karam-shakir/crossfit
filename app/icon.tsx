import { ImageResponse } from 'next/og';

export const size        = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 512, height: 512,
        background: 'radial-gradient(ellipse at 50% 30%, #1c0900, #030712)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* ── Outer hexagon glow ── */}
        <div style={{
          position: 'absolute',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
        }}/>

        {/* ── Badge container ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>

          {/* ── Arabic م letter (large, bold) ── */}
          <div style={{
            fontSize: 130,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
            fontFamily: 'serif',
            marginBottom: 8,
          }}>م</div>

          {/* ── Barbell ── */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            {/* Left outer plate */}
            <div style={{ width: 46, height: 130, background: '#f97316', borderRadius: 10 }}/>
            {/* Left inner plate */}
            <div style={{ width: 30, height: 88, background: '#fb923c', borderRadius: 7, marginLeft: 7 }}/>
            {/* Bar */}
            <div style={{ width: 120, height: 18, background: '#fdba74', borderRadius: 9 }}/>
            {/* Right inner plate */}
            <div style={{ width: 30, height: 88, background: '#fb923c', borderRadius: 7, marginRight: 7 }}/>
            {/* Right outer plate */}
            <div style={{ width: 46, height: 130, background: '#f97316', borderRadius: 10 }}/>
          </div>

          {/* ── CROSSFIT label ── */}
          <div style={{
            fontSize: 38,
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: 10,
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
          }}>CROSSFIT</div>

          {/* ── Arabic name ── */}
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: 'serif',
            marginTop: 4,
          }}>المطانيخ</div>

        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
