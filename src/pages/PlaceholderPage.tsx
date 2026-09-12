import { useStore } from '../context/StoreContext';

export function PlaceholderPage({ title, description }: { title: string, description: string }) {
  const { currentUser } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-slate-500 mb-2">หน้านี้อยู่ระหว่างการพัฒนาสำหรับ Role: {currentUser.role}</p>
        <p className="text-sm text-slate-400">ระบบทำงานได้เต็มรูปแบบในส่วนของ Dashboard, Inventory, Distribution และ Payment</p>
      </div>
    </div>
  );
}
