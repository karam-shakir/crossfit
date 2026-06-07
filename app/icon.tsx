import { ImageResponse } from 'next/og';

export const dynamic     = 'force-dynamic';
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
        {/* Orange glow */}
        <div style={{
          position: 'absolute',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
        }}/>

        {/* Circle badge border */}
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          border: '12px solid #f97316',
          display: 'flex',
        }}/>

        {/* Barbell */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Left outer plate */}
          <div style={{ width: 46, height: 160, background: '#f97316', borderRadius: 10 }}/>
          {/* Left inner plate */}
          <div style={{ width: 30, height: 110, background: '#fb923c', borderRadius: 7, marginLeft: 8 }}/>
          {/* Bar */}
          <div style={{ width: 140, height: 20, background: '#fdba74', borderRadius: 10 }}/>
          {/* Right inner plate */}
          <div style={{ width: 30, height: 110, background: '#fb923c', borderRadius: 7, marginRight: 8 }}/>
          {/* Right outer plate */}
          <div style={{ width: 46, height: 160, background: '#f97316', borderRadius: 10 }}/>
        </div>

        {/* CROSSFIT text - Latin only, safe */}
        <div style={{
          position: 'absolute',
          bottom: 110,
          fontSize: 42,
          fontWeight: 900,
          color: '#f97316',
          letterSpacing: 8,
          fontFamily: 'sans-serif',
          display: 'flex',
        }}>CROSSFIT</div>

        {/* M letter - Latin, safe */}
        <div style={{
          position: 'absolute',
          top: 90,
          fontSize: 110,
          fontWeight: 900,
          color: '#ffffff',
          fontFamily: 'sans-serif',
          display: 'flex',
        }}>M</div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
