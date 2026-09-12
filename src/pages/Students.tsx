import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, UserPlus, FileSpreadsheet, History, Image as ImageIcon, Edit2, Plus, Trash2, PackageCheck, Receipt, CreditCard } from 'lucide-react';
import { Transaction, Student } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export function Students() {
  const { students, transactions, products, currentUser, addStudent, updateStudent, deleteStudent, recordDistribution, recordPayment, language } = useStore();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [levelFilter, setLevelFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INFO' | 'DISTRIBUTION' | 'PAYMENT' | 'HISTORY'>('INFO');
  
  // Service Desk states
  const [cart, setCart] = useState<{productId: string, quantity: number}[]>([]);
  const [distNote, setDistNote] = useState('');
  const [distAttachment, setDistAttachment] = useState<string>('');
  
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payAttachment, setPayAttachment] = useState<string>('');
  
  const initialForm = {
    studentId: '',
    firstName: '',
    lastName: '',
    level: 'ปวช. 1',
    room: '1/1',
    department: 'ช่างยนต์',
    totalFee: 0,
    paidAmount: 0,
    itemsRequired: 0,
    orderedItems: [] as { productId: string; quantity: number }[],
    receivedItems: [] as { productId: string; quantity: number }[],
    itemsReceived: 0,
  };
  
  const [newStudentForm, setNewStudentForm] = useState(initialForm);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState(1);

  const canEdit = ['ADMIN', 'STAFF'].includes(currentUser.role);

  const uniqueLevels = useMemo(() => Array.from(new Set(students.map(s => s.level))).sort(), [students]);
  const uniqueRooms = useMemo(() => Array.from(new Set(students.map(s => s.room))).sort(), [students]);
  const uniqueDepts = useMemo(() => Array.from(new Set(students.map(s => s.department))).sort(), [students]);

  const filteredStudents = students.filter(s => {
    const matchSearch = s.studentId.includes(searchTerm) || s.firstName.includes(searchTerm) || s.lastName.includes(searchTerm);
    const matchLevel = levelFilter ? s.level === levelFilter : true;
    const matchRoom = roomFilter ? s.room === roomFilter : true;
    const matchDept = deptFilter ? s.department === deptFilter : true;
    return matchSearch && matchLevel && matchRoom && matchDept;
  });

  const studentTransactions = useMemo(() => {
    const targetId = editingStudentId;
    if (!targetId) return [];
    return transactions.filter(t => t.studentId === targetId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, editingStudentId]);

  const openAddModal = () => {
    setEditingStudentId(null);
    setNewStudentForm(initialForm);
    setIsFormModalOpen(true);
    setSelectedProductId('');
    setSelectedProductQty(1);
  };

  const openEditModal = (student: Student, defaultTab: 'INFO' | 'DISTRIBUTION' | 'PAYMENT' | 'HISTORY' = 'INFO') => {
    setEditingStudentId(student.id);
    setActiveTab(defaultTab);
    setNewStudentForm({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      level: student.level,
      room: student.room,
      department: student.department,
      totalFee: student.totalFee,
      paidAmount: student.paidAmount,
      itemsRequired: student.itemsRequired,
      orderedItems: student.orderedItems || [],
      receivedItems: student.receivedItems || [],
      itemsReceived: student.itemsReceived,
    });
    setSelectedProductId('');
    setSelectedProductQty(1);
    
    setCart([]);
    setDistNote('');
    setDistAttachment('');
    
    const remaining = student.totalFee - student.paidAmount;
    setPayAmount(remaining > 0 ? remaining.toString() : '');
    setPayNote('');
    setPayAttachment('');

    setIsFormModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProductId || selectedProductQty < 1) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    let newItems = [...newStudentForm.orderedItems];
    const existingIndex = newItems.findIndex(i => i.productId === selectedProductId);
    
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += selectedProductQty;
    } else {
      newItems.push({ productId: selectedProductId, quantity: selectedProductQty });
    }

    const addedItemsCount = newItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const addedFee = newItems.reduce((acc, curr) => {
      const p = products.find(x => x.id === curr.productId);
      return acc + (p ? p.price * curr.quantity : 0);
    }, 0);

    setNewStudentForm({
      ...newStudentForm,
      orderedItems: newItems,
      itemsRequired: addedItemsCount,
      totalFee: addedFee
    });
  };

  const handleRemoveItem = (productId: string) => {
    const newItems = newStudentForm.orderedItems.filter(i => i.productId !== productId);
    const addedItemsCount = newItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const addedFee = newItems.reduce((acc, curr) => {
      const p = products.find(x => x.id === curr.productId);
      return acc + (p ? p.price * curr.quantity : 0);
    }, 0);

    const newReceivedItems = newStudentForm.receivedItems.filter(i => i.productId !== productId);
    const newReceivedCount = newReceivedItems.reduce((acc, curr) => acc + curr.quantity, 0);

    setNewStudentForm({
      ...newStudentForm,
      orderedItems: newItems,
      itemsRequired: addedItemsCount,
      totalFee: addedFee,
      receivedItems: newReceivedItems,
      itemsReceived: newReceivedCount
    });
  };

  const handleRemoveReceivedItem = (productId: string) => {
    const newItems = newStudentForm.receivedItems.filter(i => i.productId !== productId);
    const receivedCount = newItems.reduce((acc, curr) => acc + curr.quantity, 0);

    setNewStudentForm({
      ...newStudentForm,
      receivedItems: newItems,
      itemsReceived: receivedCount,
    });
  };

  const handleSaveSubmit = () => {
    if (!newStudentForm.studentId || !newStudentForm.firstName || !newStudentForm.lastName) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รหัสนักเรียน, ชื่อ, นามสกุล)');
      return;
    }
    
    if (editingStudentId) {
      updateStudent(editingStudentId, newStudentForm);
    } else {
      addStudent(newStudentForm);
    }
    setIsFormModalOpen(false);
  };

  const handleDistFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDistAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePayFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPayAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addToCart = (productId: string) => {
    const orderedQty = newStudentForm.orderedItems.find(i => i.productId === productId)?.quantity || 0;
    const receivedQty = newStudentForm.receivedItems.find(i => i.productId === productId)?.quantity || 0;
    const product = products.find(p => p.id === productId);
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      const currentCartQty = existing ? existing.quantity : 0;
      
      if (currentCartQty + 1 > orderedQty - receivedQty || (product && currentCartQty + 1 > product.stock)) {
          return prev;
      }
      
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleDistribute = () => {
    if (editingStudentId && cart.length > 0) {
      recordDistribution(editingStudentId, cart, distNote, distAttachment);
      setCart([]);
      setDistNote('');
      setDistAttachment('');
      alert('บันทึกการจ่ายสินค้าสำเร็จ');
      setIsFormModalOpen(false);
    }
  };

  const handlePayment = (e: any) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount);
    if (editingStudentId && amountVal > 0) {
      recordPayment(editingStudentId, amountVal, payNote, payAttachment);
      setPayAmount('');
      setPayNote('');
      setPayAttachment('');
      alert('บันทึกการชำระเงินสำเร็จ');
      setIsFormModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('students.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">เพิ่ม ค้นหา และดูข้อมูลของนักเรียนทั้งหมด</p>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-2">
            <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              นำเข้า Excel
            </button>
            <button 
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              {t('students.add')}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder={t('students.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('common.all')} {t('students.filterLevel')}</option>
              {uniqueLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('common.all')} {t('students.filterRoom')}</option>
              {uniqueRooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('common.all')} {t('students.filterDept')}</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">{t('students.tableId')}</th>
                <th className="px-6 py-3">{t('students.tableName')}</th>
                <th className="px-6 py-3">{t('students.tableLevel')}</th>
                <th className="px-6 py-3">{t('students.tableDept')}</th>
                <th className="px-6 py-3 text-center">{t('students.tableReceived')}</th>
                <th className="px-6 py-3 text-right">{t('students.tablePaid')}</th>
                {canEdit && <th className="px-6 py-3 text-right">{t('common.manage')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map(student => {
                const displayReceived = Math.min(student.itemsReceived, student.itemsRequired);
                const receivedComplete = displayReceived >= student.itemsRequired && student.itemsRequired > 0;
                const paidComplete = student.paidAmount >= student.totalFee && student.totalFee > 0;
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.studentId}</td>
                    <td className="px-6 py-4 text-slate-700">{student.firstName} {student.lastName}</td>
                    <td className="px-6 py-4 text-slate-600">{student.level} ({student.room})</td>
                    <td className="px-6 py-4 text-slate-600">{student.department}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${receivedComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {displayReceived} / {student.itemsRequired}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paidComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        ฿{student.paidAmount} / ฿{student.totalFee}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => openEditModal(student, 'INFO')}
                            className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            {language === 'TH' ? 'จัดการ' : 'Manage'}
                          </button>
                          <button 
                            onClick={() => openEditModal(student, 'DISTRIBUTION')}
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                          >
                            <PackageCheck className="w-3 h-3" />
                            จ่ายสินค้า
                          </button>
                          <button 
                            onClick={() => openEditModal(student, 'PAYMENT')}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                          >
                            <Receipt className="w-3 h-3" />
                            รับเงิน
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(language === 'TH' ? `ยืนยันการลบข้อมูลนักเรียน รหัส ${student.studentId} (${student.firstName}) ใช่หรือไม่?\nการกระทำนี้จะถูกบันทึกใน Audit Log` : `Confirm deleting student ${student.studentId}?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 flex items-center gap-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingStudentId ? 'บริการจุดเดียวและจัดการข้อมูลนักเรียน' : 'เพิ่มข้อมูลนักเรียนใหม่'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingStudentId && (
              <div className="flex bg-slate-50 border-b border-slate-200 px-4 pt-4 gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('INFO')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'INFO' ? 'border-blue-500 text-blue-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Edit2 className="w-4 h-4" /> ข้อมูลและสั่งซื้อ
                </button>
                <button
                  onClick={() => setActiveTab('DISTRIBUTION')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'DISTRIBUTION' ? 'border-emerald-500 text-emerald-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PackageCheck className="w-4 h-4" /> จ่ายสินค้า
                </button>
                <button
                  onClick={() => setActiveTab('PAYMENT')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'PAYMENT' ? 'border-purple-500 text-purple-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="w-4 h-4" /> รับชำระเงิน
                </button>
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'HISTORY' ? 'border-blue-500 text-blue-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" /> ประวัติ
                </button>
              </div>
            )}
            
            <div className="p-6 overflow-y-auto flex-1">
              {(!editingStudentId || activeTab === 'INFO') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ข้อมูลพื้นฐาน */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-slate-800 border-b pb-2">ข้อมูลส่วนตัว</h4>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">รหัสนักเรียน *</label>
                  <input 
                    type="text" 
                    value={newStudentForm.studentId}
                    onChange={(e) => setNewStudentForm({...newStudentForm, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="เช่น 6601001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อ *</label>
                    <input 
                      type="text" 
                      value={newStudentForm.firstName}
                      onChange={(e) => setNewStudentForm({...newStudentForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล *</label>
                    <input 
                      type="text" 
                      value={newStudentForm.lastName}
                      onChange={(e) => setNewStudentForm({...newStudentForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ระดับชั้น</label>
                    <input 
                      type="text" 
                      value={newStudentForm.level}
                      onChange={(e) => setNewStudentForm({...newStudentForm, level: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ห้อง</label>
                    <input 
                      type="text" 
                      value={newStudentForm.room}
                      onChange={(e) => setNewStudentForm({...newStudentForm, room: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">แผนก</label>
                    <input 
                      type="text" 
                      value={newStudentForm.department}
                      onChange={(e) => setNewStudentForm({...newStudentForm, department: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                {editingStudentId && (
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <h4 className="font-semibold text-sm text-slate-800 mb-3">แก้ไขข้อมูลทางการเงิน</h4>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">ยอดที่ชำระแล้ว (บาท)</label>
                      <input 
                        type="number" 
                        value={newStudentForm.paidAmount}
                        onChange={(e) => setNewStudentForm({...newStudentForm, paidAmount: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">ใช้ในกรณีที่ต้องการปรับปรุงตัวเลขชำระเงินโดยตรง</p>
                    </div>
                  </div>
                )}
              </div>

              {/* รายการสินค้าที่สั่ง */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-slate-800 border-b pb-2">รายการสินค้าที่สั่ง</h4>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">เลือกสินค้า</label>
                    <select 
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- เลือกสินค้า --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.size ? `(${p.size})` : ''} - ฿{p.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-slate-700 mb-1">จำนวน</label>
                    <input 
                      type="number" 
                      min="1"
                      value={selectedProductQty}
                      onChange={(e) => setSelectedProductQty(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedProductId}
                    className="bg-slate-800 hover:bg-slate-900 text-white p-2 rounded disabled:opacity-50 transition-colors flex items-center justify-center h-[38px]"
                    title="เพิ่มรายการ"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded border border-slate-200 min-h-[150px] max-h-[220px] overflow-y-auto p-2">
                  {newStudentForm.orderedItems.length > 0 ? (
                    <ul className="space-y-2">
                      {newStudentForm.orderedItems.map((item, idx) => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <li key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-100 text-sm shadow-sm">
                            <div className="truncate flex-1">
                              <span className="font-medium text-slate-800">{product.name} {product.size && `(${product.size})`}</span>
                              <span className="text-slate-500 text-xs ml-2">@ ฿{product.price} x {item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-700">฿{product.price * item.quantity}</span>
                              <button 
                                onClick={() => handleRemoveItem(product.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm pt-10">
                      ยังไม่มีรายการสินค้า
                    </div>
                  )}
                </div>

                {/* สรุปยอดสั่งซื้อ */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-blue-800">จำนวนอุปกรณ์ที่สั่งรวม:</span>
                    <span className="font-semibold text-blue-900">{newStudentForm.itemsRequired} ชิ้น</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-blue-800">ยอดเงินที่ต้องชำระรวม:</span>
                    <span className="text-blue-900 text-lg">฿{newStudentForm.totalFee.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* รายการสินค้าที่รับแล้ว */}
                {editingStudentId && newStudentForm.receivedItems && (
                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <h4 className="font-semibold text-sm text-slate-800 border-b pb-2 mb-3">รายการสินค้าที่รับไปแล้ว</h4>
                    <div className="bg-emerald-50 rounded border border-emerald-200 min-h-[100px] max-h-[180px] overflow-y-auto p-2">
                      {newStudentForm.receivedItems.length > 0 ? (
                        <ul className="space-y-2">
                          {newStudentForm.receivedItems.map((item, idx) => {
                            const product = products.find(p => p.id === item.productId);
                            if (!product) return null;
                            return (
                              <li key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-emerald-100 text-sm shadow-sm">
                                <div className="truncate flex-1">
                                  <span className="font-medium text-emerald-800">{product.name} {product.size && `(${product.size})`}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-emerald-700">รับแล้ว {item.quantity} ชิ้น</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="h-full flex items-center justify-center text-emerald-600/50 text-sm py-4">
                          ยังไม่มีรายการที่รับไปแล้ว
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2 px-1">
                      <span className="text-slate-600">รับไปแล้วทั้งหมด:</span>
                      <span className="font-semibold text-emerald-600">{Math.min(newStudentForm.itemsReceived, newStudentForm.itemsRequired)} ชิ้น</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
            
            {editingStudentId && activeTab === 'DISTRIBUTION' && (
              <div className="flex flex-col h-full">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-blue-500" /> เลือกสินค้าที่จะจ่ายให้นักเรียน
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {newStudentForm.orderedItems.map(orderedItem => {
                    const product = products.find(p => p.id === orderedItem.productId);
                    if (!product) return null;
                    
                    const receivedQty = newStudentForm.receivedItems.find(r => r.productId === product.id)?.quantity || 0;
                    const remainingQty = orderedItem.quantity - receivedQty;
                    const inCart = cart.find(c => c.productId === product.id)?.quantity || 0;
                    
                    const canAddMore = inCart < remainingQty && inCart < product.stock;
                    const isFullyReceived = remainingQty <= 0;

                    return (
                      <div key={product.id} className={`p-3 border rounded-lg flex justify-between items-center ${isFullyReceived ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.color} | Size: {product.size}</p>
                          <p className="text-xs mt-1">
                            <span className="font-semibold text-blue-600">สั่ง: {orderedItem.quantity}</span>
                            <span className="text-slate-400 mx-1">|</span>
                            <span className="font-semibold text-emerald-600">รับแล้ว: {receivedQty}</span>
                            <span className="text-slate-400 mx-1">|</span>
                            <span className="font-semibold text-amber-600">คงเหลือที่จ่ายได้: {Math.max(0, remainingQty)}</span>
                          </p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">สต๊อกร้าน: {product.stock}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {isFullyReceived ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">รับครบแล้ว</span>
                          ) : inCart > 0 ? (
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                              <button onClick={() => removeFromCart(product.id)} className="px-2 py-1 text-slate-500 hover:bg-slate-100">-</button>
                              <span className="px-2 text-sm font-medium">{inCart}</span>
                              <button 
                                onClick={() => addToCart(product.id)} 
                                disabled={!canAddMore}
                                className="px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                              >+</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(product.id)}
                              disabled={product.stock <= 0}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {product.stock <= 0 ? 'สินค้าหมด' : 'เลือกจ่าย'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {newStudentForm.orderedItems.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      นักเรียนคนนี้ยังไม่มีรายการสั่งซื้อสินค้า
                      <br />
                      <span className="text-xs mt-2 block">กรุณาเพิ่มรายการสั่งซื้อในแท็บ "ข้อมูลและสั่งซื้อ" ก่อน</span>
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4 mt-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ (ถ้ามี)</label>
                        <input 
                          type="text" 
                          placeholder="เช่น ผู้ปกครองมารับแทน..."
                          value={distNote}
                          onChange={(e) => setDistNote(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">แนบรูปใบรับสินค้า (ถ้ามี)</label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> เลือกรูปภาพ
                            <input type="file" accept="image/*" onChange={handleDistFileChange} className="hidden" />
                          </label>
                          {distAttachment && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              ✓ แนบรูปแล้ว
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-white flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300">จ่ายให้: <span className="font-semibold text-white">{newStudentForm.firstName} {newStudentForm.lastName}</span></p>
                        <p className="text-lg font-bold mt-1">รวม {cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น</p>
                      </div>
                      <button 
                        onClick={handleDistribute}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                      >
                        ยืนยันการจ่ายสินค้า
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {editingStudentId && activeTab === 'PAYMENT' && (
              <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
                <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                  <Receipt className="w-5 h-5 text-purple-500" /> บันทึกรับชำระเงิน
                </h3>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                  <p className="text-sm text-slate-500 mb-1">ข้อมูลนักเรียน</p>
                  <p className="font-bold text-lg text-slate-900">{newStudentForm.studentId} - {newStudentForm.firstName} {newStudentForm.lastName}</p>
                  <div className="flex justify-between mt-4 border-t border-slate-200 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">ยอดรวม</p>
                      <p className="font-semibold text-slate-700">฿{newStudentForm.totalFee}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ชำระแล้ว</p>
                      <p className="font-semibold text-emerald-600">฿{newStudentForm.paidAmount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">ยอดคงเหลือ</p>
                      <p className="font-bold text-red-600 text-lg">฿{newStudentForm.totalFee - newStudentForm.paidAmount}</p>
                    </div>
                  </div>
                </div>

                {newStudentForm.totalFee - newStudentForm.paidAmount > 0 ? (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงินที่รับชำระ (฿)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="number" 
                          required
                          min="1"
                          max={newStudentForm.totalFee - newStudentForm.paidAmount}
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">* รองรับการแบ่งชำระ</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ / ช่องทางการชำระ</label>
                      <input 
                        type="text" 
                        placeholder="เช่น เงินสด, โอนเงิน"
                        value={payNote}
                        onChange={(e) => setPayNote(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">แนบรูปใบสำคัญรับเงิน / สลิปโอนเงิน (ถ้ามี)</label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> เลือกรูปภาพ
                          <input type="file" accept="image/*" onChange={handlePayFileChange} className="hidden" />
                        </label>
                        {payAttachment && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            ✓ แนบรูปแล้ว
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-sm mt-4"
                    >
                      บันทึกการชำระเงิน
                    </button>
                  </form>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 p-6 mt-4">
                    <Receipt className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-xl font-bold">นักเรียนชำระเงินครบแล้ว</p>
                  </div>
                )}
              </div>
            )}
            {editingStudentId && activeTab === 'HISTORY' && (
              <div className="flex flex-col h-full">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                  <History className="w-5 h-5 text-blue-500" /> ประวัติการทำรายการ
                </h3>
                {studentTransactions.length > 0 ? (
                  <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {studentTransactions.map(tx => (
                      <li key={tx.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${tx.type === 'PAYMENT' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {tx.type === 'PAYMENT' ? 'ชำระเงิน' : 'รับสินค้า'}
                            </span>
                            <p className="text-sm text-slate-600">{new Date(tx.date).toLocaleString('th-TH')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {tx.type === 'PAYMENT' ? `+ ฿${tx.amount}` : `+ ${tx.items?.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น`}
                            </p>
                            <p className="text-xs text-slate-500">โดย: {tx.recordedBy}</p>
                          </div>
                        </div>
                        
                        {tx.note && <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded mb-2 border border-slate-100">หมายเหตุ: {tx.note}</p>}
                        
                        {tx.attachment && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> เอกสารแนบ:</p>
                            <img src={tx.attachment} alt="Attachment" className="max-w-[200px] rounded border border-slate-200 shadow-sm" />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center bg-slate-50 rounded-lg border border-slate-200">
                    <History className="w-12 h-12 text-slate-300 mb-3" />
                    <p>ยังไม่มีประวัติการทำรายการ</p>
                  </div>
                )}
              </div>
            )}
            </div>

            {(!editingStudentId || activeTab === 'INFO') && (
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-medium text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSaveSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm shadow-sm transition-colors flex items-center gap-2"
              >
                {editingStudentId ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {editingStudentId ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
