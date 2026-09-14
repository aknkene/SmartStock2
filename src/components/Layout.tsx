import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '../context/StoreContext';
import { Login } from '../pages/Login';
import { ChangePasswordModal } from './ChangePasswordModal';

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, currentUser } = useStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      {currentUser?.forcePasswordChange && <ChangePasswordModal />}
    </div>
  );
}
