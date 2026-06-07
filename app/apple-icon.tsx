import { ImageResponse } from 'next/og';

export const dynamic     = 'force-dynamic';
export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: 180, height: 180,
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}>
        {/* Circle border */}
        <div style={{
          position: 'absolute',
          width: 160, height: 160,
          borderRadius: '50%',
          border: '5px solid #f97316',
          display: 'flex',
        }}/>
        {/* Barbell */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 16, height: 70,  background: '#f97316', borderRadius: 4 }}/>
          <div style={{ width: 10, height: 48,  background: '#fb923c', borderRadius: 3, marginLeft: 3 }}/>
          <div style={{ width: 56, height: 8,   background: '#fdba74', borderRadius: 4 }}/>
          <div style={{ width: 10, height: 48,  background: '#fb923c', borderRadius: 3, marginRight: 3 }}/>
          <div style={{ width: 16, height: 70,  background: '#f97316', borderRadius: 4 }}/>
        </div>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
