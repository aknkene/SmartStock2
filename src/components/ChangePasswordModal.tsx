import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldAlert, KeyRound } from 'lucide-react';

export function ChangePasswordModal() {
  const { currentUser, changeUserPassword } = useStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('กรุณากรอกรหัสผ่านให้ครบถ้วน');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 5) {
      setError('รหัสผ่านต้องมีอย่างน้อย 5 ตัวอักษร');
      return;
    }
    
    // Update password and clear forcePasswordChange flag
    changeUserPassword(currentUser.id, newPassword, false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-amber-50 p-6 flex flex-col items-center text-center border-b border-amber-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">บังคับเปลี่ยนรหัสผ่าน</h2>
          <p className="text-sm text-slate-600 mt-2">
            นี่คือการเข้าสู่ระบบครั้งแรกของคุณด้วยรหัสผ่านเริ่มต้น<br/>เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านใหม่
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="อย่างน้อย 5 ตัวอักษร"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors mt-2"
          >
            บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </div>
    </div>
  );
}
