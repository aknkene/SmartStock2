import { useStore } from '../context/StoreContext';
import { Users, CheckCircle, AlertTriangle, Coins, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { students, products, transactions } = useStore();

  const totalStudents = students.length;
  const fullyReceived = students.filter(s => s.itemsReceived >= s.itemsRequired).length;
  const fullyPaid = students.filter(s => s.paidAmount >= s.totalFee).length;
  
  const totalUnpaid = students.reduce((acc, s) => acc + (s.totalFee - s.paidAmount), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  let totalSales = 0;
  let totalCogs = 0;

  students.forEach(s => {
    if (s.receivedItems) {
      s.receivedItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalSales += product.price * item.quantity;
          totalCogs += (product.costPrice || 0) * item.quantity;
        }
      });
    }
  });

  const totalProfit = totalSales - totalCogs;

  // Group by room for chart
  const roomStats = students.reduce((acc: any, s) => {
    if (!acc[s.room]) acc[s.room] = { room: s.room, total: 0, paid: 0, received: 0 };
    acc[s.room].total += 1;
    if (s.paidAmount >= s.totalFee) acc[s.room].paid += 1;
    if (s.itemsReceived >= s.itemsRequired) acc[s.room].received += 1;
    return acc;
  }, {});

  const chartData = Object.values(roomStats);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ภาพรวมระบบ (Dashboard)</h1>
          <p className="text-sm text-slate-500 mt-1">สรุปข้อมูลการจ่ายสินค้าและการชำระเงิน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="ยอดขายรวม" 
          value={`฿${totalSales.toLocaleString()}`} 
          icon={Coins} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="ต้นทุนสินค้าที่ขาย" 
          value={`฿${totalCogs.toLocaleString()}`} 
          icon={Package} 
          color="bg-slate-500" 
        />
        <StatCard 
          title="กำไรรวม" 
          value={`฿${totalProfit.toLocaleString()}`} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="ยอดค้างชำระรวม" 
          value={`฿${totalUnpaid.toLocaleString()}`} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="นักเรียนทั้งหมด" 
          value={totalStudents.toString()} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="รับสินค้าครบแล้ว" 
          value={fullyReceived.toString()} 
          subtitle={`${Math.round((fullyReceived/totalStudents)*100 || 0)}% ของทั้งหมด`}
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="ชำระเงินครบแล้ว" 
          value={fullyPaid.toString()} 
          subtitle={`${Math.round((fullyPaid/totalStudents)*100 || 0)}% ของทั้งหมด`}
          icon={Coins} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">ความคืบหน้าแยกตามห้องเรียน</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="room" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="total" name="จำนวนนร. (คน)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="ชำระครบ (คน)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="รับของครบ (คน)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">สินค้าใกล้หมดสต๊อก</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              {lowStockProducts.length} รายการ
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-4">
                {lowStockProducts.map(p => (
                  <li key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">ไซส์: {p.size} | รหัส: {p.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{p.stock}</p>
                      <p className="text-xs text-slate-500">ขั้นต่ำ: {p.minStock}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle className="w-12 h-12 mb-2 text-emerald-400" />
                <p>สต๊อกสินค้าอยู่ในเกณฑ์ปกติ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: string, subtitle?: string, icon: any, color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
