import { ImageResponse } from 'next/og';

export const size        = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
        }}
      >
        {/* ===== Barbell ===== */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>

          {/* Left outer plate */}
          <div style={{
            width: 52, height: 200, background: '#f97316',
            borderRadius: 12, flexShrink: 0,
          }}/>
          {/* Left inner plate */}
          <div style={{
            width: 34, height: 140, background: '#fb923c',
            borderRadius: 8, flexShrink: 0, marginLeft: 8,
          }}/>

          {/* Bar */}
          <div style={{
            width: 160, height: 22, background: '#fdba74',
            borderRadius: 11, flexShrink: 0,
          }}/>

          {/* Right inner plate */}
          <div style={{
            width: 34, height: 140, background: '#fb923c',
            borderRadius: 8, flexShrink: 0, marginRight: 8,
          }}/>
          {/* Right outer plate */}
          <div style={{
            width: 52, height: 200, background: '#f97316',
            borderRadius: 12, flexShrink: 0,
          }}/>
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
