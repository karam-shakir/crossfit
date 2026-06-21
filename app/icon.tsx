import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          borderRadius: '50%',
        }}
      >
        <div
          style={{
            width: '80%',
            height: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ea580c',
            borderRadius: '50%',
          }}
        >
          <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>م</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
