import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../hooks/useTranslation';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  AlertCircle, 
  X, 
  Check, 
  ExternalLink,
  Users,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Semester } from '../types';

export function Semesters() {
  const { 
    semesters, 
    currentSemester, 
    addSemester, 
    updateSemester, 
    deleteSemester, 
    setActiveSemester, 
    students,
    currentUser,
    language 
  } = useStore();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED' | 'UPCOMING'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Semester, 'id'>>({
    name: '',
    academicYear: '2567',
    term: '1',
    year: 2567,
    startDate: '',
    endDate: '',
    isActive: false,
    status: 'ACTIVE',
  });

  const canEdit = currentUser ? ['ADMIN', 'STAFF'].includes(currentUser.role) : false;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredSemesters = useMemo(() => {
    return semesters.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.academicYear && s.academicYear.includes(searchTerm)) ||
                          (s.year && String(s.year).includes(searchTerm));
      const matchStatus = statusFilter === 'ALL' ? true : s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [semesters, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    const nextYear = 2567;
    setFormData({
      name: `1/${nextYear}`,
      academicYear: String(nextYear),
      year: nextYear,
      term: '1',
      startDate: `${nextYear - 543}-05-16`,
      endDate: `${nextYear - 543}-10-10`,
      isActive: false,
      status: 'UPCOMING',
    });
    setEditingSemester(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (sem: Semester) => {
    const yr = sem.year || (sem.academicYear ? parseInt(sem.academicYear) : 2567);
    setFormData({
      name: sem.name,
      academicYear: sem.academicYear || String(yr),
      year: yr,
      term: sem.term || '1',
      startDate: sem.startDate || '',
      endDate: sem.endDate || '',
      isActive: sem.isActive,
      status: sem.status,
    });
    setEditingSemester(sem);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อภาคเรียน (เช่น 1/2567)');
      return;
    }

    const payload = {
      ...formData,
      academicYear: formData.academicYear || String(formData.year || 2567),
    };

    if (editingSemester) {
      updateSemester(editingSemester.id, payload);
      if (payload.isActive) {
        setActiveSemester(editingSemester.id);
      }
      showToast(`บันทึกการแก้ไขภาคเรียน "${payload.name}" เรียบร้อยแล้ว`);
    } else {
      addSemester(payload);
      showToast(`เพิ่มภาคเรียนใหม่ "${payload.name}" เรียบร้อยแล้ว`);
    }

    setIsAdding(false);
    setEditingSemester(null);
  };

  const handleSetActive = (id: string, name: string) => {
    setActiveSemester(id);
    showToast(`กำหนดให้ "ภาคเรียน ${name}" เป็นภาคเรียนปัจจุบันเรียบร้อยแล้ว`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSemester(id);
    setDeleteConfirmId(null);
    showToast(`ลบภาคเรียน "${name}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{t('semesters.titleAlt')}</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              {semesters.length} {t('semesters.tableNameAlt')}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม แก้ไข และกำหนดภาคเรียนปัจจุบันสำหรับเชื่อมโยงระบบรับเงิน การแจกจ่าย และรายงาน
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            {t('semesters.add')}
          </button>
        )}
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Semester Featured Banner */}
      {currentSemester && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  ภาคเรียนปัจจุบัน (Active)
                </span>
                <span className="text-xs text-blue-200 font-medium">ปีการศึกษา {currentSemester.year}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                ภาคเรียนที่ {currentSemester.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-blue-100 pt-1">
                {currentSemester.startDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-300" />
                    <span>เริ่ม: {new Date(currentSemester.startDate).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {currentSemester.endDate && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-300" />
                    <span>สิ้นสุด: {new Date(currentSemester.endDate).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-300" />
                  <span>นักเรียนในระบบ: {students.length} คน</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/reports?type=DAILY_SALES`}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-xs"
              >
                <BarChart3 className="w-4 h-4" />
                ดูรายงานยอดขาย
              </Link>
              {canEdit && (
                <button
                  onClick={() => handleOpenEdit(currentSemester)}
                  className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  แก้ไขภาคเรียนนี้
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามชื่อภาคเรียน (เช่น 1/2567) หรือปีการศึกษา..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="ACTIVE">กำลังใช้งาน (Active)</option>
            <option value="CLOSED">ปิดภาคเรียนแล้ว (Closed)</option>
            <option value="UPCOMING">กำลังจะถึง (Upcoming)</option>
          </select>
        </div>
      </div>

      {/* Semesters Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-5 py-3.5">{t('semesters.tableNameAlt')}</th>
                <th className="px-5 py-3.5">{t('semesters.tableAcademicYear')}</th>
                <th className="px-5 py-3.5">{t('semesters.tableTermAlt')}</th>
                <th className="px-5 py-3.5">{t('semesters.tablePeriodAlt')}</th>
                <th className="px-5 py-3.5 text-center">{t('semesters.tableStatus')}</th>
                <th className="px-5 py-3.5 text-right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSemesters.map((sem) => {
                const isActive = sem.isActive;
                return (
                  <tr 
                    key={sem.id} 
                    className={`transition-colors ${isActive ? 'bg-blue-50/40 hover:bg-blue-50/60 font-medium' : 'hover:bg-slate-50/70'}`}
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sem.term}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 text-base">ภาคเรียน {sem.name}</span>
                          {isActive && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              ปัจจุบัน
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-700 font-mono">
                      {sem.year}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                      เทอม {sem.term}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {sem.startDate && sem.endDate ? (
                        <span>
                          {new Date(sem.startDate).toLocaleDateString('th-TH')} - {new Date(sem.endDate).toLocaleDateString('th-TH')}
                        </span>
                      ) : (
                        <span className="text-slate-400">- ไม่ได้ระบุ -</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {sem.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          กำลังใช้งาน
                        </span>
                      ) : sem.status === 'UPCOMING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                          <Clock className="w-3.5 h-3.5" />
                          กำลังจะถึง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          ปิดภาคเรียนแล้ว
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isActive && canEdit && (
                          <button
                            onClick={() => handleSetActive(sem.id, sem.name)}
                            className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 inline-flex items-center gap-1"
                            title="ตั้งเป็นภาคเรียนปัจจุบัน"
                          >
                            <Check className="w-3.5 h-3.5" />
                            ตั้งเป็นปัจจุบัน
                          </button>
                        )}
                        <Link
                          to={`/reports?type=DAILY_SALES`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="ดูรายงานของภาคเรียน"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(sem)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="แก้ไขข้อมูลภาคเรียน"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(sem.id)}
                              disabled={isActive}
                              className={`p-1.5 rounded-md transition-colors ${
                                isActive 
                                  ? 'text-slate-300 cursor-not-allowed' 
                                  : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title={isActive ? 'ไม่สามารถลบภาคเรียนที่กำลังใช้งานอยู่ได้' : 'ลบภาคเรียน'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSemesters.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-600">ไม่พบข้อมูลภาคเรียนตามเงื่อนไขที่ค้นหา</p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('semesters.add')}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Semester Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                {editingSemester ? 'แก้ไขข้อมูลภาคเรียน' : 'เพิ่มภาคเรียนใหม่'}
              </h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  ชื่อภาคเรียน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น 1/2567 หรือ 2/2567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">ใช้เป็นชื่อระบุในใบเสร็จและตัวกรองรายงาน</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    ภาคเรียนที่
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>เทอม 1</option>
                    <option value={2}>เทอม 2</option>
                    <option value={3}>ภาคฤดูร้อน</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  สถานะภาคเรียน
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const status = e.target.value as 'ACTIVE' | 'CLOSED' | 'UPCOMING';
                    setFormData({ 
                      ...formData, 
                      status,
                      isActive: status === 'ACTIVE' ? true : formData.isActive
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ACTIVE">กำลังใช้งาน (Active)</option>
                  <option value="UPCOMING">กำลังจะถึง (Upcoming)</option>
                  <option value="CLOSED">ปิดภาคเรียนแล้ว (Closed)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isActive: e.target.checked,
                      status: e.target.checked ? 'ACTIVE' : formData.status
                    })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    กำหนดเป็นภาคเรียนปัจจุบัน (Active Semester)
                  </span>
                </label>
                <p className="text-xs text-slate-400 ml-6 mt-0.5">
                  ระบบจะใช้ภาคเรียนนี้เป็นค่าเริ่มต้นในการบันทึกข้อมูลและแสดงผล
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  {editingSemester ? 'บันทึกการแก้ไข' : 'เพิ่มภาคเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (() => {
        const targetSem = semesters.find(s => s.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบภาคเรียน</h3>
                <p className="text-sm text-slate-500 mt-1">
                  คุณต้องการลบภาคเรียน <span className="font-semibold text-slate-800">{targetSem?.name}</span> ใช่หรือไม่?
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => targetSem && handleDelete(targetSem.id, targetSem.name)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
