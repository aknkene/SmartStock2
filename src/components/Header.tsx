import { Bell, Globe, ShieldAlert, LogOut, UserCheck, ArrowRightLeft, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';
import { useTranslation } from '../hooks/useTranslation';

export function Header() {
  const { currentUser, mode, setMode, language, setLanguage, logout, switchUser } = useStore();
  const { t } = useTranslation();

  if (!currentUser) return null;

  const isStaff = currentUser.role === 'STAFF';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-xs z-10">
      <div className="flex items-center gap-3">
        {mode === 'DEMO' ? (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('header.demo')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('header.production')}</span>
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
            <span>{isAdmin ? t('header.adminMode') : isStaff ? t('header.staffMode') : `${t('header.roleMode')}${currentUser.role}`}</span>
          </div>

          {/* Direct Switch to Staff / Admin button */}
          {isAdmin ? (
            <button
              onClick={() => switchUser('STAFF')}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title="สลับไปดูหน้าต่างและการทำงานของเจ้าหน้าที่ (Staff)"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{t('header.viewStaff')}</span>
            </button>
          ) : (
            <button
              onClick={() => switchUser('ADMIN')}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title="สลับกลับไปหน้าต่างผู้ดูแลระบบ (Admin) เพื่อจัดการระบบหรือเปลี่ยนรหัสผ่าน"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{t('header.viewAdmin')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
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
          <span className="hidden md:inline">{t('header.logout')}</span>
        </button>
      </div>
    </header>
  );
}
