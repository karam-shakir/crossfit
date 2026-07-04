import { ImageResponse } from 'next/og';

// حجم مطابق لما يعلنه manifest.ts (512×512) بدل 32×32 السابق
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

// ملاحظة: لا نستخدم أي نص هنا عمداً — حرف "م" العربي سابقاً كان يسبب فشل
// البناء لأن @vercel/og يحاول تحميل خط إضافي لدعم الحرف غير اللاتيني عبر
// new URL() تفشل في بعض البيئات. الشكل الهندسي وحده كافٍ ولا يحتاج أي خط.
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
          <div style={{ width: '46%', height: '20%', background: '#fdba74', borderRadius: 999 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
