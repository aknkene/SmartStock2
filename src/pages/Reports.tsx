import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';
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
  | 'ROOM_SUMMARY'
  | 'RETURNS';

export function Reports() {
  const { students, products, transactions, language } = useStore();
  
  const [reportType, setReportType] = useState<ReportType>('STOCK_REMAINING');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('1/2566');

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
      if (startDate && new Date(t.date) < new Date(startDate)) return false;
      if (endDate && new Date(t.date) > new Date(endDate)) return false;
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
      case 'DAILY_SALES':
      case 'MONTHLY_SALES':
        csvRows.push(['วันที่/เวลา', 'รหัสนักเรียน', 'จำนวนเงิน', 'ผู้บันทึก', 'หมายเหตุ'].map(escapeCsv).join(','));
        filteredTransactions.filter(t => t.type === 'PAYMENT').forEach(t => {
          const s = students.find(st => st.id === t.studentId);
          csvRows.push([new Date(t.date).toLocaleString('th-TH'), s?.studentId || '-', t.amount, t.recordedBy, t.note || ''].map(escapeCsv).join(','));
        });
        break;
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
      case 'DISTRIBUTION':
      case 'RETURNS':
        const targetType = reportType === 'STOCK_IN' ? 'STOCK_IN' : reportType === 'DISTRIBUTION' ? 'DISTRIBUTION' : 'RETURN';
        csvRows.push(['วันที่/เวลา', 'รายการสินค้า', 'รหัสนักเรียน', 'ผู้บันทึก', 'หมายเหตุ'].map(escapeCsv).join(','));
        filteredTransactions.filter(t => t.type === targetType).forEach(t => {
          const s = students.find(st => st.id === t.studentId);
          const itemsStr = t.items?.map(item => {
            const p = products.find(prod => prod.id === item.productId);
            return `${p ? p.name : 'Unknown'} x ${item.quantity}`;
          }).join(' | ') || '';
          csvRows.push([new Date(t.date).toLocaleString('th-TH'), itemsStr, targetType !== 'STOCK_IN' ? (s?.studentId || '-') : '-', t.recordedBy, t.note || ''].map(escapeCsv).join(','));
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

      case 'DAILY_SALES':
      case 'MONTHLY_SALES':
        const sales = filteredTransactions.filter(t => t.type === 'PAYMENT');
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">วันที่ / เวลา</th>
                <th className="px-4 py-3">รหัสนักเรียน (อ้างอิง)</th>
                <th className="px-4 py-3 text-right">จำนวนเงิน (บาท)</th>
                <th className="px-4 py-3">ผู้บันทึก</th>
                <th className="px-4 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-3">{new Date(t.date).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3">{students.find(s => s.id === t.studentId)?.studentId || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">฿{t.amount}</td>
                  <td className="px-4 py-3">{t.recordedBy}</td>
                  <td className="px-4 py-3 text-slate-500">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        
      case 'STOCK_IN':
      case 'DISTRIBUTION':
      case 'RETURNS':
        const targetType = reportType === 'STOCK_IN' ? 'STOCK_IN' : reportType === 'DISTRIBUTION' ? 'DISTRIBUTION' : 'RETURN';
        const typeTransactions = filteredTransactions.filter(t => t.type === targetType);
        return (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">วันที่ / เวลา</th>
                <th className="px-4 py-3">รายการสินค้า</th>
                {targetType !== 'STOCK_IN' && <th className="px-4 py-3">รหัสนักเรียน</th>}
                <th className="px-4 py-3">ผู้บันทึก</th>
                <th className="px-4 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {typeTransactions.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-3">{new Date(t.date).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3">
                    <ul className="list-disc list-inside">
                      {t.items?.map((item, idx) => {
                        const p = products.find(prod => prod.id === item.productId);
                        return (
                          <li key={idx} className="text-slate-600">
                            {p ? `${p.name} (${p.code})` : 'ไม่ทราบสินค้า'} x {item.quantity}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  {targetType !== 'STOCK_IN' && (
                    <td className="px-4 py-3">{students.find(s => s.id === t.studentId)?.studentId || '-'}</td>
                  )}
                  <td className="px-4 py-3">{t.recordedBy}</td>
                  <td className="px-4 py-3 text-slate-500">{t.note}</td>
                </tr>
              ))}
              {typeTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    ไม่มีข้อมูลในระบบ หรือไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );
      
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
    { id: 'RETURNS', label: 'การคืนและเปลี่ยนสินค้า' },
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
              
              <select 
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1/2566">ภาคเรียน 1/2566</option>
                <option value="2/2566">ภาคเรียน 2/2566</option>
                <option value="1/2567">ภาคเรียน 1/2567</option>
              </select>

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
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm border-none focus:ring-0 py-1.5 w-32"
                />
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
