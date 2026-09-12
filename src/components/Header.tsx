import { Bell, Globe, ShieldAlert, LogOut, UserCheck, ArrowRightLeft, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';

export function Header() {
  const { currentUser, mode, setMode, language, setLanguage, logout, switchUser } = useStore();

  if (!currentUser) return null;

  const isStaff = currentUser.role === 'STAFF';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-xs z-10">
      <div className="flex items-center gap-3">
        {mode === 'DEMO' ? (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'TH' ? 'Demo' : 'Demo Mode'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'TH' ? 'Production' : 'Production'}</span>
          </div>
        )}

        {/* Current Role Badge & Quick Switcher */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
            isAdmin 
              ? "bg-purple-50 text-purple-700 border-purple-200" 
              : isStaff 
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
          )}>
            {isAdmin ? <Shield className="w-3.5 h-3.5 text-purple-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isAdmin ? 'หน้าต่าง: Admin (ผู้ดูแลระบบ)' : isStaff ? 'หน้าต่าง: Staff (เจ้าหน้าที่)' : `หน้าต่าง: ${currentUser.role}`}</span>
          </div>

          {/* Direct Switch to Staff / Admin button */}
          {isAdmin ? (
            <button
              onClick={() => switchUser('STAFF')}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title="สลับไปดูหน้าต่างและการทำงานของเจ้าหน้าที่ (Staff)"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>ดูหน้าต่าง Staff</span>
            </button>
          ) : (
            <button
              onClick={() => switchUser('ADMIN')}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title="สลับกลับไปหน้าต่างผู้ดูแลระบบ (Admin) เพื่อจัดการระบบหรือเปลี่ยนรหัสผ่าน"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>สลับกลับเป็น Admin</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Environment Mode Toggle */}
        <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setMode('DEMO')}
            className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-md transition-all", mode === 'DEMO' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700")}
          >
            Demo
          </button>
          <button
            onClick={() => setMode('PRODUCTION')}
            className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-md transition-all", mode === 'PRODUCTION' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700")}
          >
            Production
          </button>
        </div>

        {/* Language Toggle */}
        <button 
          onClick={() => setLanguage(language === 'TH' ? 'EN' : 'TH')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md border border-slate-200 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          {language}
        </button>

        <button 
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-xs border border-red-200"
          title="ออกจากระบบ"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
}
