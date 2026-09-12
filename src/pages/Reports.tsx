import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Coins, 
  CreditCard, 
  TrendingUp, 
  Layers, 
  Plus, 
  PackagePlus, 
  Package, 
  ArrowUpRight, 
  CalendarDays,
  ExternalLink
} from 'lucide-react';
import { Product, Student, Transaction } from '../types';

type ReportType = 
  | 'STOCK_REMAINING'
  | 'LOW_STOCK'
  | 'STOCK_IN'
  | 'DISTRIBUTION'
  | 'INCOMPLETE_ITEMS'
  | 'UNPAID_STUDENTS'
  | 'DAILY_SALES'
  | 'MONTHLY_SALES'
  | 'ROOM_SUMMARY';

export function Reports() {
  const [searchParams] = useSearchParams();
  const { students, products, transactions, users, semesters, currentSemester, language } = useStore();
  
  const [reportType, setReportType] = useState<ReportType>('STOCK_REMAINING');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState(currentSemester?.name || '1/2567');

  useEffect(() => {
    const typeParam = searchParams.get('type') as ReportType;
    if (typeParam && [
      'STOCK_REMAINING', 'LOW_STOCK', 'STOCK_IN', 'DISTRIBUTION', 
      'INCOMPLETE_ITEMS', 'UNPAID_STUDENTS', 'DAILY_SALES', 'MONTHLY_SALES', 'ROOM_SUMMARY'
    ].includes(typeParam)) {
      setReportType(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentSemester && !semesterFilter) {
      setSemesterFilter(currentSemester.name);
    }
  }, [currentSemester]);

  const getUserName = (userId?: string) => {
    const u = users?.find(user => user.id === userId);
    return u ? u.name : userId || '-';
  };

  const uniqueRooms = useMemo(() => Array.from(new Set(students.map(s => s.room))), [students]);

  // Filters logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (roomFilter && s.room !== roomFilter) return false;
      return true;
    });
  }, [students, roomFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(t.date) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(t.date) > end) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    let csvRows: string[] = [];
    
    // Helper to escape CSV values
    const escapeCsv = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

    switch (reportType) {
      case 'STOCK_REMAINING':
        csvRows.push(['รหัสสินค้า', 'ชื่อสินค้า', 'สี/ขนาด', 'คงเหลือ'].map(escapeCsv).join(','));
        products.forEach(p => {
          csvRows.push([p.code, p.name, `${p.color}/${p.size}`, p.stock].map(escapeCsv).join(','));
        });
        break;
      case 'LOW_STOCK':
        csvRows.push(['รหัสสินค้า', 'ชื่อสินค้า', 'คงเหลือ', 'จุดสั่งซื้อ (ขั้นต่ำ)'].map(escapeCsv).join(','));
        products.filter(p => p.stock <= p.minStock).forEach(p => {
          csvRows.push([p.code, p.name, p.stock, p.minStock].map(escapeCsv).join(','));
        });
        break;
      case 'INCOMPLETE_ITEMS':
        csvRows.push(['รหัสนักเรียน', 'ชื่อ-สกุล', 'ห้อง', 'รับแล้ว', 'ต้องรับทั้งหมด'].map(escapeCsv).join(','));
        filteredStudents.filter(s => s.itemsReceived < s.itemsRequired).forEach(s => {
          csvRows.push([s.studentId, `${s.firstName} ${s.lastName}`, s.room, s.itemsReceived, s.itemsRequired].map(escapeCsv).join(','));
        });
        break;
      case 'UNPAID_STUDENTS':
        csvRows.push(['รหัสนักเรียน', 'ชื่อ-สกุล', 'ห้อง', 'ยอดรวม', 'ชำระแล้ว', 'ค้างชำระ'].map(escapeCsv).join(','));
        filteredStudents.filter(s => s.paidAmount < s.totalFee).forEach(s => {
          csvRows.push([s.studentId, `${s.firstName} ${s.lastName}`, s.room, s.totalFee, s.paidAmount, s.totalFee - s.paidAmount].map(escapeCsv).join(','));
        });
        break;
      case 'DAILY_SALES': {
        csvRows.push(['วันที่/เวลา', 'รหัสนักเรียน', 'ชื่อ-สกุล', 'ห้อง/แผนก', 'จำนวนเงิน (บาท)', 'ผู้บันทึก', 'หมายเหตุ'].map(escapeCsv).join(','));
        let totalSales = 0;
        const salesList = filteredTransactions.filter(t => t.type === 'PAYMENT');
        salesList.forEach(t => {
          const s = students.find(st => st.id === t.studentId);
          const studentName = s ? `${s.firstName} ${s.lastName}` : '-';
          const studentRoom = s ? `${s.room} (${s.department || '-'})` : '-';
          const amt = t.amount || 0;
          totalSales += amt;
          csvRows.push([
            new Date(t.date).toLocaleString('th-TH'),
            s?.studentId || '-',
            studentName,
            studentRoom,
            amt,
            getUserName(t.recordedBy),
            t.note || ''
          ].map(escapeCsv).join(','));
        });
        csvRows.push([''].map(escapeCsv).join(','));
        csvRows.push(['ยอดรวมเงินทั้งสิ้น (บาท)', '', '', '', totalSales, `${salesList.length} รายการ`, ''].map(escapeCsv).join(','));
        break;
      }
      case 'MONTHLY_SALES': {
        const salesList = filteredTransactions.filter(t => t.type === 'PAYMENT');
        let totalSales = 0;

        // Group by month
        const monthlySummary: Record<string, { count: number; total: number }> = {};
        salesList.forEach(t => {
          const d = new Date(t.date);
          const monthKey = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
          const amt = t.amount || 0;
          totalSales += amt;
          if (!monthlySummary[monthKey]) {
            monthlySummary[monthKey] = { count: 0, total: 0 };
          }
          monthlySummary[monthKey].count += 1;
          monthlySummary[monthKey].total += amt;
        });

        csvRows.push(['--- สรุปยอดขายรายเดือน ---'].map(escapeCsv).join(','));
        csvRows.push(['เดือน/ปี', 'จำนวนรายการชำระเงิน', 'ยอดเงินรวม (บาท)'].map(escapeCsv).join(','));
        Object.entries(monthlySummary).forEach(([month, stat]) => {
          csvRows.push([month, stat.count, stat.total].map(escapeCsv).join(','));
        });
        csvRows.push(['ยอดรวมเงินทุกเดือน', `${salesList.length} รายการ`, totalSales].map(escapeCsv).join(','));
        csvRows.push([''].map(escapeCsv).join(','));

        csvRows.push(['--- รายละเอียดรายการชำระเงินทั้งหมด ---'].map(escapeCsv).join(','));
        csvRows.push(['วันที่/เวลา', 'รหัสนักเรียน', 'ชื่อ-สกุล', 'ห้อง/แผนก', 'จำนวนเงิน (บาท)', 'ผู้บันทึก', 'หมายเหตุ'].map(escapeCsv).join(','));
        salesList.forEach(t => {
          const s = students.find(st => st.id === t.studentId);
          const studentName = s ? `${s.firstName} ${s.lastName}` : '-';
          const studentRoom = s ? `${s.room} (${s.department || '-'})` : '-';
          csvRows.push([
            new Date(t.date).toLocaleString('th-TH'),
            s?.studentId || '-',
            studentName,
            studentRoom,
            t.amount || 0,
            getUserName(t.recordedBy),
            t.note || ''
          ].map(escapeCsv).join(','));
        });
        csvRows.push(['ยอดรวมเงินทั้งสิ้น (บาท)', '', '', '', totalSales, `${salesList.length} รายการ`, ''].map(escapeCsv).join(','));
        break;
      }
      case 'ROOM_SUMMARY':
        csvRows.push(['ห้องเรียน', 'นักเรียนทั้งหมด', 'ชำระครบแล้ว', 'รับของครบแล้ว', 'ยอดค้างชำระรวม'].map(escapeCsv).join(','));
        const roomStats = filteredStudents.reduce((acc: any, s) => {
          if (!acc[s.room]) acc[s.room] = { room: s.room, total: 0, paidComplete: 0, itemsComplete: 0, totalDebt: 0 };
          acc[s.room].total += 1;
          if (s.paidAmount >= s.totalFee) acc[s.room].paidComplete += 1;
          if (s.itemsReceived >= s.itemsRequired) acc[s.room].itemsComplete += 1;
          acc[s.room].totalDebt += (s.totalFee - s.paidAmount);
          return acc;
        }, {});
        Object.values(roomStats).forEach((stat: any) => {
          csvRows.push([stat.room, stat.total, stat.paidComplete, stat.itemsComplete, stat.totalDebt].map(escapeCsv).join(','));
        });
        break;
      case 'STOCK_IN':
        csvRows.push(['วันที่/เวลา', 'รหัสสินค้า', 'ชื่อสินค้า', 'จำนวนรับเข้า', 'ผู้บันทึก', 'หมายเหตุ'].map(escapeCsv).join(','));
        filteredTransactions.filter(t => t.type === 'STOCK_IN').forEach(t => {
          t.items?.forEach(item => {
            const p = products.find(prod => prod.id === item.productId);
            csvRows.push([
              new Date(t.date).toLocaleString('th-TH'),
              p?.code || '-',
              p?.name || 'ไม่ระบุ',
              item.quantity,
              getUserName(t.recordedBy),
              t.note || ''
            ].map(escapeCsv).join(','));
          });
        });
        break;
      case 'DISTRIBUTION':
        csvRows.push(['วันที่/เวลา', 'รายการสินค้า', 'รหัสนักเรียน', 'ชื่อนักเรียน', 'ผู้บันทึก', 'หมายเหตุ'].map(escapeCsv).join(','));
        filteredTransactions.filter(t => t.type === 'DISTRIBUTION').forEach(t => {
          const s = students.find(st => st.id === t.studentId);
          const itemsStr = t.items?.map(item => {
            const p = products.find(prod => prod.id === item.productId);
            return `${p ? p.name : 'Unknown'} x ${item.quantity}`;
          }).join(' | ') || '';
          csvRows.push([
            new Date(t.date).toLocaleString('th-TH'), 
            itemsStr, 
            s?.studentId || '-', 
            s ? `${s.firstName} ${s.lastName}` : '-',
            getUserName(t.recordedBy), 
            t.note || ''
          ].map(escapeCsv).join(','));
        });
        break;
      default:
        csvRows.push(['ไม่มีข้อมูลรายงาน'].map(escapeCsv).join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'STOCK_REMAINING':
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">รหัสสินค้า</th>
                <th className="px-4 py-3">ชื่อสินค้า</th>
                <th className="px-4 py-3">สี/ขนาด</th>
                <th className="px-4 py-3 text-right">คงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.color} / {p.size}</td>
                  <td className="px-4 py-3 text-right font-bold">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'LOW_STOCK':
        const lowStock = products.filter(p => p.stock <= p.minStock);
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">รหัสสินค้า</th>
                <th className="px-4 py-3">ชื่อสินค้า</th>
                <th className="px-4 py-3 text-right">คงเหลือ</th>
                <th className="px-4 py-3 text-right">จุดสั่งซื้อ (ขั้นต่ำ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStock.map(p => (
                <tr key={p.id} className="bg-red-50/50">
                  <td className="px-4 py-3">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{p.stock}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{p.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'INCOMPLETE_ITEMS':
        const incompleteStudents = filteredStudents.filter(s => s.itemsReceived < s.itemsRequired);
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">รหัสนักเรียน</th>
                <th className="px-4 py-3">ชื่อ-สกุล</th>
                <th className="px-4 py-3">ห้อง</th>
                <th className="px-4 py-3 text-center">รับแล้ว / ต้องรับทั้งหมด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incompleteStudents.map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.studentId}</td>
                  <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.room}</td>
                  <td className="px-4 py-3 text-center text-amber-600 font-medium">
                    {s.itemsReceived} / {s.itemsRequired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'UNPAID_STUDENTS':
        const unpaidStudents = filteredStudents.filter(s => s.paidAmount < s.totalFee);
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">รหัสนักเรียน</th>
                <th className="px-4 py-3">ชื่อ-สกุล</th>
                <th className="px-4 py-3">ห้อง</th>
                <th className="px-4 py-3 text-right">ยอดรวม</th>
                <th className="px-4 py-3 text-right">ชำระแล้ว</th>
                <th className="px-4 py-3 text-right">ค้างชำระ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidStudents.map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.studentId}</td>
                  <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.room}</td>
                  <td className="px-4 py-3 text-right">฿{s.totalFee}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">฿{s.paidAmount}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-bold">฿{s.totalFee - s.paidAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'DAILY_SALES': {
        const sales = filteredTransactions.filter(t => t.type === 'PAYMENT');
        const totalAmount = sales.reduce((sum, t) => sum + (t.amount || 0), 0);
        const averageAmount = sales.length > 0 ? Math.round(totalAmount / sales.length) : 0;

        // Group by day for daily subtotals
        const dailyGroups: Record<string, { dateStr: string; count: number; total: number }> = {};
        sales.forEach(t => {
          const d = new Date(t.date);
          const dateStr = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
          if (!dailyGroups[dateStr]) {
            dailyGroups[dateStr] = { dateStr, count: 0, total: 0 };
          }
          dailyGroups[dateStr].count += 1;
          dailyGroups[dateStr].total += (t.amount || 0);
        });

        return (
          <div className="space-y-6 p-4">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">ยอดรวมเงินทั้งหมด</p>
                  <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">฿{totalAmount.toLocaleString('th-TH')}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">รวมจากทุกรายการชำระเงินตามตัวกรอง</p>
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">จำนวนรายการชำระเงิน</p>
                  <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{sales.length.toLocaleString('th-TH')} <span className="text-sm font-normal text-blue-700">รายการ</span></p>
                  <p className="text-[11px] text-blue-700 mt-0.5">มีผู้ชำระสำเร็จแล้ว</p>
                </div>
              </div>

              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-purple-600 text-white rounded-xl shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">ยอดเฉลี่ยต่อรายการ</p>
                  <p className="text-2xl font-extrabold text-purple-900 mt-0.5">฿{averageAmount.toLocaleString('th-TH')}</p>
                  <p className="text-[11px] text-purple-700 mt-0.5">เฉลี่ยต่อ 1 ใบเสร็จ/การชำระ</p>
                </div>
              </div>
            </div>

            {/* Daily Subtotal Breakdown (if multiple days) */}
            {Object.keys(dailyGroups).length > 1 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  สรุปยอดเงินรวมแยกตามรายวัน
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {Object.values(dailyGroups).map(g => (
                    <div key={g.dateStr} className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-2xs">
                      <span className="text-slate-500 block font-medium">{g.dateStr}</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-600">{g.count} รายการ</span>
                        <span className="font-bold text-emerald-700 text-sm">฿{g.total.toLocaleString('th-TH')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Transactions Table with Grand Total Footer */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  รายละเอียดรายการรับชำระเงินทั้งหมด ({sales.length} รายการ)
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  รวมเงินทั้งหมด: ฿{totalAmount.toLocaleString('th-TH')}
                </span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">วันที่ / เวลา</th>
                    <th className="px-4 py-3 font-semibold">รหัสนักเรียน</th>
                    <th className="px-4 py-3 font-semibold">ชื่อ - นามสกุล</th>
                    <th className="px-4 py-3 font-semibold">ห้อง / แผนก</th>
                    <th className="px-4 py-3 text-right font-semibold">จำนวนเงิน (บาท)</th>
                    <th className="px-4 py-3 font-semibold">ผู้บันทึก</th>
                    <th className="px-4 py-3 font-semibold">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map(t => {
                    const student = students.find(s => s.id === t.studentId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleString('th-TH')}</td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-800">{student?.studentId || '-'}</td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          {student ? `${student.firstName} ${student.lastName}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {student ? `${student.room} ${student.department || ''}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">
                          ฿{(t.amount || 0).toLocaleString('th-TH')}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{getUserName(t.recordedBy)}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{t.note || '-'}</td>
                      </tr>
                    );
                  })}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        ไม่พบรายการชำระเงินตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Table Footer with Bold Grand Total */}
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <tr>
                    <td colSpan={4} className="px-4 py-3.5 text-right text-slate-800 text-sm uppercase tracking-wider">
                      ยอดรวมเงินทั้งสิ้น (Grand Total):
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-base text-emerald-800 bg-emerald-100/70 border-t-2 border-emerald-500 border-b-2 border-double border-emerald-700">
                      ฿{totalAmount.toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">
                      {sales.length} รายการ
                    </td>
                    <td className="px-4 py-3.5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      }

      case 'MONTHLY_SALES': {
        const sales = filteredTransactions.filter(t => t.type === 'PAYMENT');
        const totalAmount = sales.reduce((sum, t) => sum + (t.amount || 0), 0);
        const averageAmount = sales.length > 0 ? Math.round(totalAmount / sales.length) : 0;

        // Group by month
        const monthlyGroups: Record<string, { monthKey: string; count: number; total: number }> = {};
        sales.forEach(t => {
          const d = new Date(t.date);
          const monthKey = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
          if (!monthlyGroups[monthKey]) {
            monthlyGroups[monthKey] = { monthKey, count: 0, total: 0 };
          }
          monthlyGroups[monthKey].count += 1;
          monthlyGroups[monthKey].total += (t.amount || 0);
        });

        const monthList = Object.values(monthlyGroups);

        return (
          <div className="space-y-6 p-4">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">ยอดรวมเงินรายเดือนทั้งหมด</p>
                  <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">฿{totalAmount.toLocaleString('th-TH')}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">รวมเงินชำระทุกเดือนในงวดนี้</p>
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">จำนวนรายการทั้งหมด</p>
                  <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{sales.length.toLocaleString('th-TH')} <span className="text-sm font-normal text-blue-700">รายการ</span></p>
                  <p className="text-[11px] text-blue-700 mt-0.5">มีผู้ชำระสำเร็จในงวด</p>
                </div>
              </div>

              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-purple-600 text-white rounded-xl shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">จำนวนเดือนที่มีรายการ</p>
                  <p className="text-2xl font-extrabold text-purple-900 mt-0.5">{monthList.length} <span className="text-sm font-normal text-purple-700">เดือน</span></p>
                  <p className="text-[11px] text-purple-700 mt-0.5">เฉลี่ยต่อเดือน ฿{(monthList.length > 0 ? Math.round(totalAmount / monthList.length) : 0).toLocaleString('th-TH')}</p>
                </div>
              </div>
            </div>

            {/* Monthly Summary Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  ตารางสรุปยอดขายแยกตามรายเดือน
                </h4>
                <span className="text-xs text-slate-600 font-medium">รวม {monthList.length} เดือน</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">เดือน / ปี</th>
                    <th className="px-4 py-2.5 text-center font-semibold">จำนวนรายการ</th>
                    <th className="px-4 py-2.5 text-right font-semibold">ยอดเงินรวม (บาท)</th>
                    <th className="px-4 py-2.5 text-center font-semibold">สัดส่วน (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthList.map(m => {
                    const percent = totalAmount > 0 ? ((m.total / totalAmount) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={m.monthKey} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{m.monthKey}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{m.count} รายการ</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700 text-base">฿{m.total.toLocaleString('th-TH')}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-10 text-right">{percent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {monthList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        ยังไม่มีข้อมูลการขายในงวดที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-slate-800 uppercase tracking-wider">
                      รวมทุกเดือนทั้งสิ้น:
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {sales.length} รายการ
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-base text-emerald-800 bg-emerald-100/70 border-t-2 border-emerald-500 border-b-2 border-double border-emerald-700">
                      ฿{totalAmount.toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3 text-center text-emerald-700">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Detailed Transactions List */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  รายละเอียดรายการชำระเงินทั้งหมด ({sales.length} รายการ)
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  รวมเงินทั้งหมด: ฿{totalAmount.toLocaleString('th-TH')}
                </span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">วันที่ / เวลา</th>
                    <th className="px-4 py-3 font-semibold">รหัสนักเรียน</th>
                    <th className="px-4 py-3 font-semibold">ชื่อ - นามสกุล</th>
                    <th className="px-4 py-3 font-semibold">ห้อง / แผนก</th>
                    <th className="px-4 py-3 text-right font-semibold">จำนวนเงิน (บาท)</th>
                    <th className="px-4 py-3 font-semibold">ผู้บันทึก</th>
                    <th className="px-4 py-3 font-semibold">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map(t => {
                    const student = students.find(s => s.id === t.studentId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleString('th-TH')}</td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-800">{student?.studentId || '-'}</td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          {student ? `${student.firstName} ${student.lastName}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {student ? `${student.room} ${student.department || ''}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">
                          ฿{(t.amount || 0).toLocaleString('th-TH')}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{getUserName(t.recordedBy)}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{t.note || '-'}</td>
                      </tr>
                    );
                  })}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        ไม่พบรายการชำระเงินตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <tr>
                    <td colSpan={4} className="px-4 py-3.5 text-right text-slate-800 text-sm uppercase tracking-wider">
                      ยอดรวมเงินทั้งสิ้น (Grand Total):
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-base text-emerald-800 bg-emerald-100/70 border-t-2 border-emerald-500 border-b-2 border-double border-emerald-700">
                      ฿{totalAmount.toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">
                      {sales.length} รายการ
                    </td>
                    <td className="px-4 py-3.5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      }
        
      case 'STOCK_IN': {
        const stockInTransactions = filteredTransactions.filter(t => t.type === 'STOCK_IN');
        const totalUnitsIn = stockInTransactions.reduce((acc, t) => {
          return acc + (t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
        }, 0);

        return (
          <div className="space-y-4">
            {/* Stock-in Header Card linking to Inventory */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 sm:mt-0">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">รายงานการรับสินค้าเข้าคลัง (Stock In)</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    รวมทั้งรายการสต๊อกเริ่มต้นตอนสร้างสินค้าใหม่ และการเติมสต๊อกในระบบจัดการสต๊อกสินค้า
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">รับเข้าทั้งหมด</span>
                  <span className="font-bold text-blue-700 text-base">{totalUnitsIn.toLocaleString('th-TH')} <span className="text-xs font-normal text-slate-600">ชิ้น</span></span>
                </div>
                <Link
                  to="/inventory?action=add"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  title="ไปที่จัดการสต๊อกสินค้าเพื่อเพิ่มสินค้าใหม่หรือเพิ่มสต๊อก"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มสินค้าเข้าสต๊อก</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </Link>
              </div>
            </div>

            {/* Stock In Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">วันที่ / เวลา</th>
                    <th className="px-4 py-3">รหัสและรายการสินค้า</th>
                    <th className="px-4 py-3 text-center">จำนวนรับเข้า</th>
                    <th className="px-4 py-3">ผู้บันทึก</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockInTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(t.date).toLocaleString('th-TH')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {t.items?.map((item, idx) => {
                            const p = products.find(prod => prod.id === item.productId);
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                  {p?.code || '-'}
                                </span>
                                <span className="text-slate-900 font-medium">
                                  {p ? p.name : 'ไม่ทราบสินค้า'}
                                </span>
                                {(p?.size || p?.color) && (
                                  <span className="text-xs text-slate-500">
                                    ({[p.color, p.size].filter(Boolean).join('/')})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          +{t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} ชิ้น
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs font-medium">
                        {getUserName(t.recordedBy)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate" title={t.note}>
                        {t.note || '-'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {t.items?.[0] && (() => {
                          const p = products.find(prod => prod.id === t.items![0].productId);
                          return p ? (
                            <Link
                              to={`/inventory?search=${encodeURIComponent(p.code)}`}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              <span>ดูสต๊อก</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : null;
                        })()}
                      </td>
                    </tr>
                  ))}
                  {stockInTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-600">ยังไม่มีประวัติการรับสินค้าเข้าตามเงื่อนไขที่เลือก</p>
                        <p className="text-xs text-slate-400 mt-1">สามารถเพิ่มสินค้าใหม่หรือปรับปรุงสต๊อกในหน้าจัดการสต๊อกสินค้า</p>
                        <Link
                          to="/inventory?action=add"
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          เพิ่มสินค้าใหม่เข้าสต๊อก
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'DISTRIBUTION': {
        const typeTransactions = filteredTransactions.filter(t => t.type === 'DISTRIBUTION');
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">วันที่ / เวลา</th>
                <th className="px-4 py-3">รายการสินค้า</th>
                <th className="px-4 py-3">รหัสนักเรียน</th>
                <th className="px-4 py-3">ชื่อนักเรียน</th>
                <th className="px-4 py-3">ผู้บันทึก</th>
                <th className="px-4 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {typeTransactions.map(t => {
                const s = students.find(st => st.id === t.studentId);
                return (
                  <tr key={t.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{new Date(t.date).toLocaleString('th-TH')}</td>
                    <td className="px-4 py-3">
                      <ul className="list-disc list-inside">
                        {t.items?.map((item, idx) => {
                          const p = products.find(prod => prod.id === item.productId);
                          return (
                            <li key={idx} className="text-slate-700">
                              {p ? `${p.name} (${p.code})` : 'ไม่ทราบสินค้า'} x {item.quantity}
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{s?.studentId || '-'}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {s ? `${s.firstName} ${s.lastName} (${s.room})` : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{getUserName(t.recordedBy)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.note || '-'}</td>
                  </tr>
                );
              })}
              {typeTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    ไม่มีข้อมูลการจ่ายสินค้าในระบบ หรือไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );
      }
      
      case 'ROOM_SUMMARY':
        const roomStats = filteredStudents.reduce((acc: any, s) => {
          if (!acc[s.room]) acc[s.room] = { room: s.room, total: 0, paidComplete: 0, itemsComplete: 0, totalDebt: 0 };
          acc[s.room].total += 1;
          if (s.paidAmount >= s.totalFee) acc[s.room].paidComplete += 1;
          if (s.itemsReceived >= s.itemsRequired) acc[s.room].itemsComplete += 1;
          acc[s.room].totalDebt += (s.totalFee - s.paidAmount);
          return acc;
        }, {});
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ห้องเรียน</th>
                <th className="px-4 py-3 text-center">นักเรียนทั้งหมด</th>
                <th className="px-4 py-3 text-center">ชำระครบแล้ว</th>
                <th className="px-4 py-3 text-center">รับของครบแล้ว</th>
                <th className="px-4 py-3 text-right">ยอดค้างชำระรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.values(roomStats).map((stat: any) => (
                <tr key={stat.room}>
                  <td className="px-4 py-3 font-medium">{stat.room}</td>
                  <td className="px-4 py-3 text-center">{stat.total}</td>
                  <td className="px-4 py-3 text-center text-emerald-600">{stat.paidComplete}</td>
                  <td className="px-4 py-3 text-center text-blue-600">{stat.itemsComplete}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">฿{stat.totalDebt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return (
          <div className="p-8 text-center text-slate-500">
            กำลังพัฒนารูปแบบรายงานนี้
          </div>
        );
    }
  };

  const menuOptions = [
    { id: 'STOCK_REMAINING', label: 'สต๊อกคงเหลือ' },
    { id: 'LOW_STOCK', label: 'สินค้าใกล้หมด' },
    { id: 'STOCK_IN', label: 'การรับสินค้าเข้า' },
    { id: 'DISTRIBUTION', label: 'การจ่ายสินค้า' },
    { id: 'INCOMPLETE_ITEMS', label: 'นักเรียนที่รับสินค้าไม่ครบ' },
    { id: 'UNPAID_STUDENTS', label: 'นักเรียนที่ค้างชำระ' },
    { id: 'DAILY_SALES', label: 'ยอดขายรายวัน' },
    { id: 'MONTHLY_SALES', label: 'ยอดขายรายเดือน' },
    { id: 'ROOM_SUMMARY', label: 'แยกตามห้องเรียน' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col print:m-0 print:p-0 print:h-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ระบบรายงาน (Reports)</h1>
          <p className="text-sm text-slate-500 mt-1">สรุปข้อมูลและส่งออกรายงานรูปแบบต่างๆ</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadExcel}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {language === 'TH' ? 'ดาวน์โหลด Excel' : 'Export Excel'}
          </button>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            {language === 'TH' ? 'พิมพ์ / PDF' : 'Print / PDF'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 print:block">
        {/* Sidebar Report Type Selector */}
        <div className="w-full lg:w-64 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 print:hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> ประเภทรายงาน
            </h3>
          </div>
          <div className="p-2 space-y-1 h-[200px] lg:h-[calc(100vh-250px)] overflow-y-auto">
            {menuOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setReportType(opt.id as ReportType)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  reportType === opt.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 print:hidden">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">ตัวกรอง:</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <select 
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.name}>
                      ภาคเรียน {sem.name} {sem.isActive ? '(ปัจจุบัน)' : ''}
                    </option>
                  ))}
                </select>
                <Link
                  to="/semesters"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-1 whitespace-nowrap flex items-center gap-1"
                  title="เพิ่มหรือแก้ไขภาคเรียน"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>จัดการภาคเรียน</span>
                </Link>
              </div>

              <select 
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทุกระดับชั้น/ห้อง</option>
                {uniqueRooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 border border-slate-300 rounded-md px-2 bg-white">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm border-none focus:ring-0 py-1.5 w-32"
                  title="วันที่เริ่มต้น"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm border-none focus:ring-0 py-1.5 w-32"
                  title="วันที่สิ้นสุด"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    !startDate && !endDate
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setStartDate(today);
                    setEndDate(today);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    startDate && startDate === endDate
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                    setStartDate(firstDay);
                    setEndDate(lastDay);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border bg-white text-slate-600 border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  เดือนนี้
                </button>
              </div>
            </div>
          </div>

          {/* Report Title for Print */}
          <div className="hidden print:block p-6 text-center">
            <h2 className="text-xl font-bold">รายงาน {menuOptions.find(o => o.id === reportType)?.label}</h2>
            <p className="text-sm mt-1">ภาคเรียนที่ {semesterFilter} {roomFilter ? `(ห้อง ${roomFilter})` : ''}</p>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto p-0 print:overflow-visible">
            {renderReportContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
