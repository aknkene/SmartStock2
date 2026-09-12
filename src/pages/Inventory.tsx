import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  X, 
  History, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Info, 
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Product } from '../types';

export function Inventory() {
  const { products, currentUser, updateProduct, addProduct, deleteProduct, stockHistory, language } = useStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState<'ALL' | 'INCREASE' | 'DECREASE' | 'SAME'>('ALL');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [addForm, setAddForm] = useState<Omit<Product, 'id'>>({
    code: '', name: '', category: '', size: '', color: '', costPrice: 0, price: 0, stock: 0, minStock: 0
  });

  // STAFF and ADMIN roles can edit
  const canEdit = currentUser ? ['ADMIN', 'STAFF'].includes(currentUser.role) : false;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = stockHistory.filter(h => {
    const matchesSearch = 
      h.productName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      h.productCode.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      h.actionText.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      (h.note && h.note.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
      (h.recorderName && h.recorderName.toLowerCase().includes(historySearchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (historyFilterType === 'INCREASE') return h.diff > 0;
    if (historyFilterType === 'DECREASE') return h.diff < 0;
    if (historyFilterType === 'SAME') return h.diff === 0;
    return true;
  });

  const totalIncreases = stockHistory.filter(h => h.diff > 0).length;
  const totalDecreases = stockHistory.filter(h => h.diff < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการสต๊อกสินค้า</h1>
          <p className="text-sm text-slate-500 mt-1">ตรวจสอบ อัปเดตจำนวนสินค้าคงเหลือ และติดตามประวัติการแก้ไขสต๊อก</p>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-2">
            <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              นำเข้า Excel
            </button>
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              เพิ่มสินค้าใหม่
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-950">บันทึกประวัติเรียบร้อย:</span>
              <span className="ml-1.5 text-sm font-medium text-emerald-900">{toastMessage}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { 
                setActiveTab('history'); 
                setToastMessage(null); 
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              ดูประวัติการแก้ไขสต๊อก
            </button>
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>รายการสินค้าคงคลัง</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'inventory' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติการแก้ไขสต๊อก</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'history' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {stockHistory.length}
          </span>
        </button>
      </div>

      {activeTab === 'inventory' ? (
        /* Inventory Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อสินค้า หรือ รหัสสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>แสดง {filteredProducts.length} จากทั้งหมด {products.length} รายการ</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">รหัสสินค้า</th>
                  <th className="px-6 py-3">ชื่อสินค้า</th>
                  <th className="px-6 py-3">ประเภท</th>
                  <th className="px-6 py-3">สี/ขนาด</th>
                  <th className="px-6 py-3 text-right">ราคาทุน</th>
                  <th className="px-6 py-3 text-right">ราคาขาย</th>
                  <th className="px-6 py-3 text-right">กำไร/หน่วย</th>
                  <th className="px-6 py-3 text-center">คงเหลือ</th>
                  <th className="px-6 py-3 text-right">มูลค่าสต๊อก(ทุน)</th>
                  <th className="px-6 py-3 text-center">สถานะ</th>
                  {canEdit && <th className="px-6 py-3 text-right">จัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map(product => {
                  const isLowStock = product.stock <= product.minStock;
                  const costPrice = product.costPrice || 0;
                  const profitPerUnit = product.price - costPrice;
                  const stockValue = product.stock * costPrice;
                  const productHistoryCount = stockHistory.filter(h => h.productId === product.id).length;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.code}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        {productHistoryCount > 0 && (
                          <button
                            onClick={() => {
                              setHistorySearchTerm(product.code);
                              setActiveTab('history');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-0.5 transition-colors"
                          >
                            <History className="w-3 h-3" />
                            ประวัติแก้ไข ({productHistoryCount})
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{product.category}</td>
                      <td className="px-6 py-4 text-slate-600">{product.color} / {product.size}</td>
                      <td className="px-6 py-4 text-right text-slate-700">฿{costPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-700">฿{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-medium">฿{profitPerUnit.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        <span className="text-base">{product.stock}</span>
                        {product.initialStock ? (
                          <span className="text-xs text-slate-400 ml-1 font-normal">/ {product.initialStock}</span>
                        ) : ''}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600 font-medium">฿{stockValue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ใกล้หมด
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            ปกติ
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setEditForm({ ...product });
                              setEditNote('');
                            }}
                            className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(language === 'TH' ? `ยืนยันการลบสินค้า: ${product.name} รหัส ${product.code} ใช่หรือไม่?\nการกระทำนี้จะถูกบันทึกใน Audit Log` : `Confirm deleting product: ${product.name}?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="inline-flex items-center text-xs text-red-600 hover:text-red-800 hover:bg-red-50 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            {language === 'TH' ? 'ลบ' : 'Delete'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={canEdit ? 11 : 10} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="font-medium text-slate-600">ไม่พบรายการสินค้า</p>
                        <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเพิ่มสินค้าใหม่</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock History Log View */
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">บันทึกการแก้ไขสต๊อกทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stockHistory.length} <span className="text-sm font-normal text-slate-500">ครั้ง</span></p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">รายการปรับเพิ่มสต๊อก (+)</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{totalIncreases} <span className="text-sm font-normal text-slate-500">ครั้ง</span></p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">รายการปรับลดสต๊อก (-)</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{totalDecreases} <span className="text-sm font-normal text-slate-500">ครั้ง</span></p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative max-w-md w-full">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหาตามชื่อสินค้า รหัสสินค้า วันที่ หรือหมายเหตุ..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={historyFilterType}
                  onChange={(e) => setHistoryFilterType(e.target.value as any)}
                  className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ALL">ประเภททั้งหมด</option>
                  <option value="INCREASE">เฉพาะรายการเพิ่มสต๊อก (+)</option>
                  <option value="DECREASE">เฉพาะรายการปรับลดสต๊อก (-)</option>
                  <option value="SAME">เฉพาะการแก้ไขข้อมูลทั่วไป</option>
                </select>

                {historySearchTerm && (
                  <button
                    onClick={() => setHistorySearchTerm('')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1"
                  >
                    ล้างการค้นหา
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 whitespace-nowrap">วันที่ / เวลา</th>
                    <th className="px-6 py-3 whitespace-nowrap">รหัส & ชื่อสินค้า</th>
                    <th className="px-6 py-3">รายละเอียดประวัติการแก้ไข</th>
                    <th className="px-6 py-3 text-center whitespace-nowrap">การเปลี่ยนแปลง</th>
                    <th className="px-6 py-3 text-center whitespace-nowrap">สต๊อกเดิม ➔ ใหม่</th>
                    <th className="px-6 py-3 whitespace-nowrap">ผู้บันทึก</th>
                    <th className="px-6 py-3">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredHistory.map((item) => {
                    const isIncrease = item.diff > 0;
                    const isDecrease = item.diff < 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{item.formattedDate}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 ml-5">{item.formattedTime}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {item.productCode} {item.size ? `(${item.size})` : ''} {item.color ? `สี ${item.color}` : ''}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 text-sm">
                            {item.actionText}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {isIncrease ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +{item.diff} ชิ้น
                            </span>
                          ) : isDecrease ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              {item.diff} ชิ้น
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              คงเดิม
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-slate-500 font-medium">{item.oldStock}</span>
                          <span className="mx-1.5 text-slate-400">➔</span>
                          <span className="font-bold text-slate-900">{item.newStock}</span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-xs">
                          <span className="font-medium text-slate-900">{item.recorderName || item.recordedBy}</span>
                        </td>

                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {item.note ? (
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                              {item.note}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <Clock className="w-10 h-10 text-slate-300 mb-2" />
                          <p className="font-medium text-slate-600">ยังไม่พบประวัติการแก้ไขสต๊อก</p>
                          <p className="text-xs text-slate-400 mt-1">เมื่อมีการแก้ไขสต๊อกสินค้า ระบบจะบันทึกประวัติอัตโนมัติที่นี่</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">เพิ่มสินค้าใหม่</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">รหัสสินค้า</label>
                  <input 
                    type="text" 
                    value={addForm.code}
                    onChange={(e) => setAddForm({...addForm, code: e.target.value})}
                    placeholder="เช่น SHIRT-XL-WHT"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อสินค้า</label>
                  <input 
                    type="text" 
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    placeholder="เช่น เสื้อนักศึกษา ชาย"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ประเภท</label>
                  <input 
                    type="text" 
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                    placeholder="เช่น เสื้อ, กางเกง, อุปกรณ์"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">สี</label>
                  <input 
                    type="text" 
                    value={addForm.color}
                    onChange={(e) => setAddForm({...addForm, color: e.target.value})}
                    placeholder="เช่น ขาว, กรมท่า"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ขนาด</label>
                  <input 
                    type="text" 
                    value={addForm.size}
                    onChange={(e) => setAddForm({...addForm, size: e.target.value})}
                    placeholder="เช่น S, M, L, XL, 32"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ราคาทุน (บาท)</label>
                  <input 
                    type="number" 
                    value={addForm.costPrice}
                    onChange={(e) => setAddForm({...addForm, costPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ราคาขาย (บาท)</label>
                  <input 
                    type="number" 
                    value={addForm.price}
                    onChange={(e) => setAddForm({...addForm, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">สต๊อกเริ่มต้น</label>
                  <input 
                    type="number" 
                    value={addForm.stock !== undefined ? addForm.stock : 0}
                    onChange={(e) => setAddForm({...addForm, stock: e.target.value ? parseInt(e.target.value) : 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ขั้นต่ำแจ้งเตือน</label>
                  <input 
                    type="number" 
                    value={addForm.minStock !== undefined ? addForm.minStock : 0}
                    onChange={(e) => setAddForm({...addForm, minStock: e.target.value ? parseInt(e.target.value) : 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button 
                onClick={() => setIsAddingProduct(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-medium text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  if (!addForm.code || !addForm.name) {
                    alert('กรุณากรอกรหัสและชื่อสินค้า');
                    return;
                  }
                  addProduct({ ...addForm, initialStock: addForm.stock });
                  setIsAddingProduct(false);
                  setAddForm({code: '', name: '', category: '', size: '', color: '', costPrice: 0, price: 0, stock: 0, minStock: 0});
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors shadow-sm"
              >
                เพิ่มสินค้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal with Live Stock Diff & History Preview */}
      {editingProduct && (() => {
        const currentStock = editingProduct.stock;
        const targetStock = editForm.stock !== undefined ? Number(editForm.stock) : currentStock;
        const diff = targetStock - currentStock;

        return (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">แก้ไขรายการสินค้า</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{editingProduct.code} - {editingProduct.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setEditNote('');
                  }} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Live History Audit Preview */}
                {diff !== 0 && (
                  <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    diff > 0 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${diff > 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div>
                      <p className="font-bold">
                        {diff > 0 ? 'ระบบจะบันทึกประวัติการเพิ่มสต๊อก:' : 'ระบบจะบันทึกประวัติการปรับลดสต๊อก:'}
                      </p>
                      <p className="mt-1 font-medium leading-relaxed">
                        {diff > 0 
                          ? `ได้เพิ่มรายการสต๊อกจาก ${currentStock} เป็น ${targetStock} ชิ้น (+${diff} ชิ้น)` 
                          : `ได้ปรับลดรายการสต๊อกจาก ${currentStock} เป็น ${targetStock} ชิ้น (${diff} ชิ้น)`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">รหัสสินค้า</label>
                    <input 
                      type="text" 
                      value={editForm.code || ''}
                      onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อสินค้า</label>
                    <input 
                      type="text" 
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ประเภท</label>
                    <input 
                      type="text" 
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">สี</label>
                    <input 
                      type="text" 
                      value={editForm.color || ''}
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ขนาด</label>
                    <input 
                      type="text" 
                      value={editForm.size || ''}
                      onChange={(e) => setEditForm({...editForm, size: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ราคาทุน (บาท)</label>
                    <input 
                      type="number" 
                      value={editForm.costPrice || 0}
                      onChange={(e) => setEditForm({...editForm, costPrice: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ราคาขาย (บาท)</label>
                    <input 
                      type="number" 
                      value={editForm.price || 0}
                      onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">สต๊อกทั้งหมด (เริ่มต้น)</label>
                    <input 
                      type="number" 
                      value={editForm.initialStock !== undefined ? editForm.initialStock : (editForm.stock || 0)}
                      onChange={(e) => setEditForm({...editForm, initialStock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  {/* Stock Input Highlighted */}
                  <div className="col-span-2 bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-blue-900">
                        สต๊อกคงเหลือ (ปัจจุบัน)
                      </label>
                      <span className="text-xs text-slate-500">
                        สต๊อกเดิม: <strong className="text-slate-800">{currentStock}</strong> ชิ้น
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={editForm.stock !== undefined ? editForm.stock : 0}
                        onChange={(e) => setEditForm({...editForm, stock: e.target.value ? parseInt(e.target.value) : 0})}
                        className="w-full px-3 py-2 bg-white font-bold text-slate-900 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                      {diff !== 0 && (
                        <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                          diff > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff} ชิ้น
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">ขั้นต่ำแจ้งเตือน</label>
                    <input 
                      type="number" 
                      value={editForm.minStock !== undefined ? editForm.minStock : 0}
                      onChange={(e) => setEditForm({...editForm, minStock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หมายเหตุการแก้ไขสต๊อก (ถ้ามี)
                    </label>
                    <input 
                      type="text" 
                      placeholder="เช่น รับของเพิ่มจากผู้ผลิต, ปรับยอดนับจริงประจำเดือน..."
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setEditNote('');
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => {
                    if (editingProduct) {
                      const logItem = updateProduct(editingProduct.id, editForm, editNote);
                      setEditingProduct(null);
                      setEditNote('');
                      if (logItem) {
                        setToastMessage(logItem.actionText);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

