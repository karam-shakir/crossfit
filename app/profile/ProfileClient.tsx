'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

const AVATARS = ['🏋️','💪','🔥','⚡','🥇','🏆','🎯','👑','🦁','🐉','🚀','💥','🌟','⚔️','🛡️','🦅','🐺','🏅'];

export default function ProfileClient({ member }: { member: any }) {
  const [nameAr, setNameAr] = useState(member.nameAr);
  const [avatar, setAvatar] = useState(member.avatar || '🏋️');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'avatar'>('info');

  async function saveInfo() {
    setSaving(true); setMessage(''); setError('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameAr, avatar }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setMessage('✅ تم تحديث الملف الشخصي');
    setSaving(false);
  }

  async function savePassword() {
    if (newPassword !== confirmPassword) { setError('كلمة المرور غير متطابقة'); return; }
    if (newPassword.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setSaving(true); setMessage(''); setError('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else { setMessage('✅ تم تغيير كلمة المرور'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex">
      <Navbar member={{ ...member, nameAr, avatar }} />
      <main className="flex-1 lg:mr-56 pb-28 lg:pb-0">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

          {/* Header */}
          <div className="bg-gradient-to-l from-indigo-900/40 to-purple-900/40 rounded-2xl border border-indigo-700/30 p-5 flex items-center gap-4">
            <span className="text-6xl">{avatar}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{nameAr}</h1>
              <p className="text-sm text-gray-400">@{member.username}</p>
              <p className="text-xs text-gray-500">انضم {member.joinDate} • {member.role === 'admin' ? '👑 مدير' : '🏋️ عضو'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'info', label: '👤 المعلومات' },
              { key: 'avatar', label: '🎨 الصورة' },
              { key: 'password', label: '🔒 كلمة المرور' },
            ].map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key as any); setMessage(''); setError(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {message && <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-3 text-green-400 text-sm text-center">{message}</div>}
          {error && <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-sm text-center">⚠️ {error}</div>}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">الاسم بالعربي</label>
                <input value={nameAr} onChange={e => setNameAr(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="اسمك بالعربي" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">اسم المستخدم</label>
                <input value={member.username} disabled
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-600 mt-1">اسم المستخدم لا يمكن تغييره</p>
              </div>
              <button onClick={saveInfo} disabled={saving || !nameAr.trim()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-semibold transition-colors">
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          )}

          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <p className="text-sm text-gray-400">اختر الإيموجي الذي يمثلك:</p>
              <div className="grid grid-cols-6 gap-3">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className={`text-3xl p-2 rounded-xl transition-all ${
                      avatar === a ? 'bg-indigo-600 scale-110 ring-2 ring-indigo-400' : 'bg-gray-800 hover:bg-gray-700'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
              <button onClick={saveInfo} disabled={saving}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-semibold transition-colors">
                {saving ? 'جاري الحفظ...' : '💾 حفظ الصورة الرمزية'}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">كلمة المرور الحالية</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">كلمة المرور الجديدة</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="6 أحرف على الأقل" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">تأكيد كلمة المرور</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="أعد كتابة كلمة المرور" />
              </div>
              <button onClick={savePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-semibold transition-colors">
                {saving ? 'جاري الحفظ...' : '🔒 تغيير كلمة المرور'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
