import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldAlert, PackageSearch, Eye, EyeOff, User, Shield, Briefcase } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('staff01');
  const [password, setPassword] = useState('12345');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useStore();

  const handleLogin = (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const u = customUser || username;
    const p = customPass || password;
    if (!u || !p) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    const success = login(u, p);
    if (!success) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const selectAccount = (u: string, p: string, autoLogin: boolean = false) => {
    setUsername(u);
    setPassword(p);
    setError('');
    if (autoLogin) {
      handleLogin(undefined, u, p);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30">
            <PackageSearch className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SmartStock</h1>
          <p className="text-slate-500 mt-1 text-center text-xs">ระบบบริหารจัดการสินค้าคงคลังและแจกจ่ายอุปกรณ์นักเรียน</p>
        </div>

        {/* Info callout for default password */}
        <div className="mb-5 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-800 flex flex-col gap-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-blue-900">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
            เข้าใช้งานด้วยบัญชี Staff รหัสผ่านเริ่มต้นคือ: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-blue-700 border border-blue-300">12345</code>
          </div>
          <div className="text-[11px] text-blue-700/80">
            ผู้ดูแลระบบ (Admin) สามารถเข้าไปจัดการเปลี่ยนรหัสผ่านให้ Staff ได้ตลอดเวลา
          </div>
        </div>

        {/* Quick Demo Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">เลือกบัญชีทดสอบด่วน</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectAccount('staff01', '12345')}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                username === 'staff01' ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold leading-tight">Staff</span>
              <span className="text-[10px] text-slate-400">staff01</span>
            </button>

            <button
              type="button"
              onClick={() => selectAccount('admin', '12345')}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                username === 'admin' ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold leading-tight">Admin</span>
              <span className="text-[10px] text-slate-400">admin</span>
            </button>

            <button
              type="button"
              onClick={() => selectAccount('exec01', '12345')}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                username === 'exec01' ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold leading-tight">Executive</span>
              <span className="text-[10px] text-slate-400">exec01</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 rounded-lg flex items-start gap-2 border border-red-100">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none transition-all"
              placeholder="กรอกชื่อผู้ใช้ เช่น staff01 หรือ admin"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">รหัสผ่าน (Password)</label>
              <span className="text-[11px] text-slate-400 font-mono">ค่าเริ่มต้น: 12345</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none transition-all"
                placeholder="กรอกรหัสผ่าน"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-md shadow-blue-500/20 text-sm mt-2"
          >
            เข้าสู่ระบบ {username === 'staff01' ? 'เป็น Staff (เจ้าหน้าที่)' : username === 'admin' ? 'เป็น Admin (แอดมิน)' : ''}
          </button>
        </form>
      </div>
    </div>
  );
}
