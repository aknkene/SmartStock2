import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Users as UsersIcon, UserCheck, UserX, Search, Filter, Plus, MoreVertical, 
  X, History, Key, CheckCircle, XCircle, ShieldAlert, Eye, EyeOff, 
  ArrowRightLeft, Sparkles, Check, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { User, Role } from '../types';

const roleLabels: Record<Role, string> = {
  ADMIN: 'ผู้ดูแลระบบ',
  STAFF: 'เจ้าหน้าที่',
  EXECUTIVE: 'ผู้บริหาร'
};

export function Users() {
  const { 
    users, currentUser, addUser, updateUser, deleteUser, 
    changeUserPassword, switchUser, auditLogs, originalUser, language 
  } = useStore();
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);

  // Dedicated Password Change Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('12345');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('12345');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [forcePasswordChangeCheck, setForcePasswordChangeCheck] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;
  const recentlyActive = users.filter(u => u.lastLogin && (new Date().getTime() - new Date(u.lastLogin).getTime()) < 86400000).length;

  const uniqueDepartments = useMemo(() => {
    const depts = users.map(u => u.department).filter(Boolean) as string[];
    return Array.from(new Set(depts));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter ? u.role === roleFilter : true;
      const matchStatus = statusFilter ? u.status === statusFilter : true;
      const matchDept = deptFilter ? u.department === deptFilter : true;
      return matchSearch && matchRole && matchStatus && matchDept;
    });
  }, [users, searchTerm, roleFilter, statusFilter, deptFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setDeptFilter('');
  };

  const initialFormState = {
    prefix: '', firstName: '', lastName: '', email: '', phone: '',
    position: '', department: '', username: '', password: '', confirmPassword: '',
    forcePasswordChange: true, role: 'STAFF' as Role, managedRoom: '',
    status: 'ACTIVE' as const, startDate: '', endDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleSaveUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.username) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, นามสกุล, ชื่อผู้ใช้)');
      return;
    }
    
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
    }

    const userData: Omit<User, 'id'> = {
      username: formData.username,
      password: formData.password || undefined,
      name: `${formData.prefix || ''}${formData.firstName} ${formData.lastName}`.trim(),
      prefix: formData.prefix,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      managedRoom: formData.managedRoom,
      role: formData.role,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      forcePasswordChange: formData.forcePasswordChange,
    };

    if (editingUserId) {
      updateUser(editingUserId, userData);
      if (formData.password) {
        changeUserPassword(editingUserId, formData.password, formData.forcePasswordChange);
      }
    } else {
      addUser(userData);
    }
    
    setIsAddingUser(false);
    setEditingUserId(null);
    setFormData(initialFormState);
  };

  const handleOpenPasswordModal = (user: User) => {
    setPasswordModalUser(user);
    setNewPasswordInput('12345');
    setConfirmPasswordInput('12345');
    setShowPasswordInput(false);
    setForcePasswordChangeCheck(user.forcePasswordChange || false);
    setActiveDropdownId(null);
  };

  const handleSavePassword = () => {
    if (!passwordModalUser) return;
    if (!newPasswordInput) {
      alert('กรุณาระบุรหัสผ่านใหม่');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    
    changeUserPassword(passwordModalUser.id, newPasswordInput, forcePasswordChangeCheck);
    
    setPasswordToast({
      message: `เปลี่ยนรหัสผ่านสำหรับ ${passwordModalUser.name} (@${passwordModalUser.username}) เป็น "${newPasswordInput}" สำเร็จเรียบร้อยแล้ว`,
      type: 'success'
    });
    
    setPasswordModalUser(null);
    setTimeout(() => {
      setPasswordToast(null);
    }, 6000);
  };

  const handleEditClick = (user: User) => {
    setFormData({
      prefix: user.prefix || '',
      firstName: user.firstName || user.name.split(' ')[0] || '',
      lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      username: user.username,
      password: '',
      confirmPassword: '',
      forcePasswordChange: user.forcePasswordChange || false,
      role: user.role,
      managedRoom: user.managedRoom || '',
      status: user.status,
      startDate: user.startDate || '',
      endDate: user.endDate || ''
    });
    setEditingUserId(user.id);
    setIsAddingUser(true);
    setActiveDropdownId(null);
  };

  const handleDeleteClick = (user: User) => {
    if (window.confirm(language === 'TH' ? `ยืนยันการลบบัญชีผู้ใช้งาน: ${user.username} ใช่หรือไม่?\nการกระทำนี้จะถูกบันทึกใน Audit Log` : `Confirm deleting user: ${user.username}?`)) {
      deleteUser(user.id);
    }
    setActiveDropdownId(null);
  };

  const handleStatusChange = (user: User, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    updateUser(user.id, { status: newStatus });
    setActiveDropdownId(null);
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin)</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          ปัจจุบันคุณกำลังเปิดดูระบบในมุมมองของ <strong>{currentUser?.name || 'เจ้าหน้าที่ (Staff)'}</strong><br />
          เพื่อความปลอดภัยของระบบ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการบัญชีผู้ใช้และเปลี่ยนรหัสผ่านได้
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {originalUser?.role === 'ADMIN' && (
            <button
              onClick={() => switchUser('ADMIN')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>สลับเป็นมุมมองแอดมิน (Admin) เพื่อเปลี่ยนรหัสผ่าน</span>
            </button>
          )}
          <Link
            to="/inventory"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            กลับไปหน้าสต๊อกสินค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Summary Cards */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('users.titleAlt')}</h1>
        <p className="text-sm text-slate-500 mt-1">เพิ่ม แก้ไข และกำหนดสิทธิ์การใช้งานของบุคลากร</p>
      </div>

      {/* Password Change Notification Toast */}
      {passwordToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">บันทึกรหัสผ่านใหม่สำเร็จ</p>
              <p className="text-xs text-emerald-700">{passwordToast.message}</p>
            </div>
          </div>
          <button onClick={() => setPasswordToast(null)} className="text-emerald-500 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><UsersIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">ผู้ใช้งานทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><UserCheck className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">กำลังใช้งาน (ACTIVE)</p>
            <p className="text-2xl font-bold text-emerald-600">{activeUsers}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><UserX className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">ระงับการใช้งาน (SUSPENDED)</p>
            <p className="text-2xl font-bold text-red-600">{suspendedUsers}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><History className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">เข้าใช้ล่าสุด 24 ชม.</p>
            <p className="text-2xl font-bold text-purple-600">{recentlyActive}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
        
        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4 flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="ค้นหาชื่อ-นามสกุล หรือ Username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button 
              onClick={() => {
                setFormData(initialFormState);
                setEditingUserId(null);
                setIsAddingUser(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {t('users.add')}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">กรอง:</span>
            </div>
            
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกบทบาท (Roles)</option>
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสถานะบัญชี</option>
              <option value="ACTIVE">ใช้งาน (ACTIVE)</option>
              <option value="SUSPENDED">ระงับ (SUSPENDED)</option>
            </select>

            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกแผนก/หน่วยงาน</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {(searchTerm || roleFilter || statusFilter || deptFilter) && (
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">{t('users.tableFullNameAlt')}</th>
                <th className="px-4 py-3">{t('users.tableNameAlt')}</th>
                <th className="px-4 py-3">{t('users.tableRoleAlt')}</th>
                <th className="px-4 py-3">{t('users.tableDeptAlt')}</th>
                <th className="px-4 py-3">{t('users.tableRoomAlt')}</th>
                <th className="px-4 py-3 text-center">{t('users.tableStatusAlt')}</th>
                <th className="px-4 py-3">{t('users.tableLastLoginAlt')}</th>
                <th className="px-4 py-3 text-center">{t('common.manage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" ref={dropdownRef}>
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.department || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{user.managedRoom || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('th-TH') : 'ไม่เคยเข้าใช้งาน'}
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenPasswordModal(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-xs font-semibold border border-amber-200 transition-colors shadow-2xs"
                        title={`เปลี่ยนรหัสผ่านสำหรับ ${user.name}`}
                      >
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>เปลี่ยนรหัส</span>
                      </button>

                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Action Dropdown Menu */}
                    {activeDropdownId === user.id && (
                      <div className="absolute right-8 top-10 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-left text-sm">
                        <button onClick={() => handleEditClick(user)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">แก้ไขข้อมูล</button>
                        <button onClick={() => handleOpenPasswordModal(user)} className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-2">
                          <Key className="w-4 h-4 text-amber-600" />
                          เปลี่ยนรหัสผ่าน
                        </button>
                        <button onClick={() => { setHistoryUserId(user.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">ดูประวัติการใช้งาน</button>
                        
                        <div className="h-px bg-slate-200 my-1"></div>
                        
                        {user.status === 'ACTIVE' ? (
                          <button onClick={() => handleStatusChange(user, 'SUSPENDED')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-amber-600 font-medium">ระงับการใช้งาน</button>
                        ) : (
                          <button onClick={() => handleStatusChange(user, 'ACTIVE')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-emerald-600 font-medium">เปิดใช้งานอีกครั้ง</button>
                        )}
                        
                        <button onClick={() => handleDeleteClick(user)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 font-medium">ลบบัญชี</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {editingUserId ? <ShieldAlert className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                {editingUserId ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Section 1: Personal Info */}
              <section>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">1. ข้อมูลส่วนตัว</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">คำนำหน้า</label>
                    <input type="text" value={formData.prefix} onChange={e => setFormData({...formData, prefix: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" placeholder="นาย/นาง/นางสาว" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อ <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">อีเมล</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ตำแหน่ง</label>
                    <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">แผนกหรือฝ่าย</label>
                    <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </section>

              {/* Section 2: Login Info */}
              <section>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">2. ข้อมูลเข้าสู่ระบบ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm bg-slate-50" readOnly={!!editingUserId} />
                    {editingUserId && <p className="text-[10px] text-slate-500 mt-1">* ไม่สามารถแก้ไข Username ได้</p>}
                  </div>
                  <div className="hidden md:block"></div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{editingUserId ? 'ตั้งรหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)' : 'รหัสผ่านเริ่มต้น'} {!editingUserId && <span className="text-red-500">*</span>}</label>
                    <input type="password" required={!editingUserId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน {!editingUserId && <span className="text-red-500">*</span>}</label>
                    <input type="password" required={!editingUserId} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input type="checkbox" checked={formData.forcePasswordChange} onChange={e => setFormData({...formData, forcePasswordChange: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-slate-700 font-medium">บังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Section 3: Permissions */}
              <section>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">3. สิทธิ์การใช้งาน</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">บทบาทผู้ใช้งาน <span className="text-red-500">*</span></label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm">
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ห้องที่รับผิดชอบ</label>
                    <input type="text" value={formData.managedRoom} onChange={e => setFormData({...formData, managedRoom: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" placeholder="เช่น 1/1, 2/3" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">สถานะบัญชี</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'ACTIVE'|'SUSPENDED'})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm font-medium">
                      <option value="ACTIVE" className="text-emerald-600">ใช้งาน (ACTIVE)</option>
                      <option value="SUSPENDED" className="text-red-600">ระงับ (SUSPENDED)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">วันที่เริ่มใช้งานสิทธิ์</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">วันที่สิ้นสุดสิทธิ์ (ถ้ามี)</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsAddingUser(false)}
                className="px-5 py-2.5 text-slate-700 hover:bg-slate-200 border border-slate-300 bg-white rounded-lg font-medium text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSaveUser}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                บันทึกผู้ใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log / History Modal */}
      {historyUserId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                ประวัติการใช้งาน (Audit Log)
              </h3>
              <button onClick={() => setHistoryUserId(null)} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {auditLogs.filter(log => log.userId === historyUserId).length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {auditLogs.filter(log => log.userId === historyUserId).map(log => (
                    <li key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.action}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString('th-TH')}</span>
                      </div>
                      <p className="text-sm text-slate-800">{log.details}</p>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Key className="w-3 h-3" /> System ID: {log.id} | โหมด: {log.mode} | อุปกรณ์: บราวเซอร์ (Mocked IP)
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>ไม่พบประวัติการใช้งานสำหรับบัญชีนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">เปลี่ยนรหัสผ่านผู้ใช้งาน</h3>
                  <p className="text-xs text-amber-100 mt-0.5">โดยสิทธิ์ผู้ดูแลระบบ (Admin)</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Target User Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {passwordModalUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{passwordModalUser.name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                        {roleLabels[passwordModalUser.role]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">@{passwordModalUser.username}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">รหัสผ่านปัจจุบัน</span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {passwordModalUser.password || '12345'}
                  </span>
                </div>
              </div>

              {/* Password Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ตัวเลือกรหัสผ่านด่วน</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPasswordInput('12345');
                      setConfirmPasswordInput('12345');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <span>🔄 ตั้งเป็น 12345 (ค่าเริ่มต้น)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = Math.floor(100000 + Math.random() * 900000).toString();
                      setNewPasswordInput(randomPass);
                      setConfirmPasswordInput(randomPass);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>🎲 สุ่มรหัส 6 หลัก</span>
                  </button>
                </div>
              </div>

              {/* Input: New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่านใหม่ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInput ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่ (เช่น 12345)"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Input: Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่อีกครั้ง <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPasswordInput ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 text-sm outline-none font-mono ${
                    confirmPasswordInput && confirmPasswordInput !== newPasswordInput
                      ? 'border-red-300 focus:ring-red-500 bg-red-50/40'
                      : 'border-slate-300 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                />
                {confirmPasswordInput && confirmPasswordInput !== newPasswordInput && (
                  <p className="text-[11px] text-red-600 mt-1">รหัสผ่านทั้งสองช่องไม่ตรงกัน</p>
                )}
              </div>

              {/* Checkbox: Force Password Change */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forcePasswordChangeCheck}
                  onChange={(e) => setForcePasswordChangeCheck(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">บังคับให้ผู้ใช้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบ</span>
                  <span className="text-[11px] text-slate-500 block">ผู้ใช้จะต้องกำหนดรหัสผ่านใหม่ด้วยตนเองเมื่อล็อกอินครั้งต่อไป</span>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกรหัสผ่านใหม่</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
