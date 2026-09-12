import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../context/StoreContext';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'EXECUTIVE', 'STAFF'] },
  { id: 'students', label: 'จัดการนักเรียน', icon: Users, path: '/students', roles: ['ADMIN', 'STAFF'] },
  { id: 'inventory', label: 'จัดการสต๊อกสินค้า', icon: Package, path: '/inventory', roles: ['ADMIN', 'STAFF'] },
  { id: 'reports', label: 'รายงาน', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'EXECUTIVE', 'STAFF'] },
  { id: 'users', label: 'ผู้ใช้งานระบบ', icon: Settings, path: '/users', roles: ['ADMIN'] },
];

export function Sidebar() {
  const { currentUser, switchUser } = useStore();
  const location = useLocation();

  if (!currentUser) return null;

  const allowedMenus = menuItems.filter((m) => m.roles.includes(currentUser.role));
  const isStaff = currentUser.role === 'STAFF';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider">UniStock</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {allowedMenus.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  location.pathname === item.path
                    ? "bg-blue-600/10 text-blue-400"
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold flex items-center justify-between">
          <span>ผู้ใช้งานปัจจุบัน</span>
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", isStaff ? "bg-blue-900/60 text-blue-300" : "bg-purple-900/60 text-purple-300")}>
            {currentUser.role}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{currentUser.name}</span>
            <span className="text-xs text-slate-400">@{currentUser.username}</span>
          </div>
        </div>

        <button
          onClick={() => switchUser(isStaff ? 'ADMIN' : 'STAFF')}
          className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
        >
          <span>{isStaff ? '👑 สลับเป็นแอดมิน (Admin)' : '👤 ดูหน้าต่าง Staff (เจ้าหน้าที่)'}</span>
        </button>
      </div>
    </aside>
  );
}
