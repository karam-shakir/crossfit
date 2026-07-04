// هيكل تحميل فوري يطابق أبعاد الواجهة النهائية (Sidebar + المحتوى) لمنع أي وميض
// أو قفزة تخطيط (layout shift) أثناء انتقال Next.js بين الصفحات، ويعطي شعوراً
// بالاستجابة الفورية بدل شاشة فارغة أثناء انتظار جلب البيانات من الخادم.
export default function PageLoading() {
  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden animate-pulse">
      {/* Sidebar skeleton — سطح المكتب فقط */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-l border-slate-200 min-h-screen fixed right-0 top-0 z-40 p-4 gap-2">
        <div className="h-10 bg-slate-200 rounded-xl mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 bg-slate-100 rounded-xl" />
        ))}
      </aside>

      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-4">
          <div className="flex items-center justify-between pt-4">
            <div className="h-6 w-40 bg-slate-200 rounded-lg" />
            <div className="h-9 w-20 bg-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-32 bg-white border border-slate-200 rounded-2xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl" />
          ))}
        </div>
      </main>

      {/* Bottom nav skeleton — الجوال فقط */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-[68px] bg-slate-900/95 z-40" />
    </div>
  );
}
