import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Student, Product, Transaction, Role, AuditLog, StockHistoryItem, Semester } from '../types';
import { mockUsers, mockStudents, mockProducts, mockTransactions, mockStockHistory, mockSemesters } from '../data/mock';

type AppMode = 'DEMO' | 'PRODUCTION';
type Language = 'TH' | 'EN';

interface StoreContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  users: User[];
  students: Student[];
  products: Product[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  stockHistory: StockHistoryItem[];
  semesters: Semester[];
  currentSemester: Semester | undefined;
  // Actions
  recordPayment: (studentId: string, amount: number, note: string, attachment?: string) => void;
  recordDistribution: (studentId: string, items: { productId: string; quantity: number }[], note?: string, attachment?: string) => void;
  recordStockIn: (productId: string, quantity: number, note?: string) => void;
  updateProductStock: (productId: string, quantity: number, type: 'IN' | 'OUT') => void;
  addStudent: (student: Omit<Student, 'id' | 'paidAmount' | 'itemsReceived'>) => void;
  updateStudent: (studentId: string, data: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  updateProduct: (productId: string, data: Partial<Product>, note?: string) => StockHistoryItem | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  changeUserPassword: (userId: string, newPassword: string, forceChange?: boolean) => void;
  switchUser: (userIdOrRole: string) => User | null;
  addSemester: (semester: Omit<Semester, 'id'>) => void;
  updateSemester: (id: string, data: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;
  setActiveSemester: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('DEMO');
  const [language, setLanguage] = useState<Language>('TH');
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  
  // Storage for Demo mode
  const [demoUsers, setDemoUsers] = useState<User[]>(mockUsers);
  const [demoStudents, setDemoStudents] = useState<Student[]>(mockStudents);
  const [demoProducts, setDemoProducts] = useState<Product[]>(mockProducts);
  const [demoTransactions, setDemoTransactions] = useState<Transaction[]>(mockTransactions);
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>(mockStockHistory);
  const [semesters, setSemesters] = useState<Semester[]>(mockSemesters);
  
  // Storage for Production mode (Empty initially, meant to be fetched from Google Sheets / Backend)
  const [prodUsers, setProdUsers] = useState<User[]>([]);
  const [prodStudents, setProdStudents] = useState<Student[]>([]);
  const [prodProducts, setProdProducts] = useState<Product[]>([]);
  const [prodTransactions, setProdTransactions] = useState<Transaction[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Active data based on mode
  const users = mode === 'DEMO' ? demoUsers : prodUsers;
  const students = mode === 'DEMO' ? demoStudents : prodStudents;
  const products = mode === 'DEMO' ? demoProducts : prodProducts;
  const transactions = mode === 'DEMO' ? demoTransactions : prodTransactions;

  const currentSemester = semesters.find(s => s.isActive) || semesters[0];

  const setUsersState = mode === 'DEMO' ? setDemoUsers : setProdUsers;
  const setStudents = mode === 'DEMO' ? setDemoStudents : setProdStudents;
  const setProducts = mode === 'DEMO' ? setDemoProducts : setProdProducts;
  const setTransactions = mode === 'DEMO' ? setDemoTransactions : setProdTransactions;

  const logAction = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log${Date.now()}`,
      action,
      details,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      mode,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    console.log(`[AUDIT LOG - ${mode}] ${action}: ${details}`);
    // Here we would also push this log to Google Sheets backend via fetch()
  };

  const login = (username: string, password?: string) => {
    const cleanUser = username.trim().toLowerCase();
    const user = users.find(u => 
      (u.username.toLowerCase() === cleanUser || (cleanUser === 'staff' && u.username.toLowerCase() === 'staff01')) && 
      u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      logAction('LOGIN', `เข้าสู่ระบบสำเร็จ: ${user.name} (${user.username})`);
      return true;
    }
    return false;
  };

  const switchUser = (userIdOrRole: string): User | null => {
    const target = users.find(u => 
      u.id === userIdOrRole || 
      u.role === userIdOrRole || 
      u.username.toLowerCase() === userIdOrRole.toLowerCase() ||
      (userIdOrRole.toLowerCase() === 'staff' && u.role === 'STAFF') ||
      (userIdOrRole.toLowerCase() === 'admin' && u.role === 'ADMIN')
    );
    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      logAction('SWITCH_ROLE', `สลับมุมมองผู้ใช้เป็น: ${target.name} [บทบาท: ${target.role}]`);
      return target;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const recordPayment = (studentId: string, amount: number, note: string, attachment?: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: `t${Date.now()}`,
      type: 'PAYMENT',
      studentId,
      amount,
      note,
      attachment,
      date: new Date().toISOString(),
      recordedBy: currentUser.id,
    };
    setTransactions((prev) => [...prev, newTx]);
    
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, paidAmount: s.paidAmount + amount } : s))
    );
    logAction('RECORD_PAYMENT', `รับชำระเงิน ${amount} บาท จากนักเรียน ID: ${studentId}`);
  };

  const recordDistribution = (studentId: string, items: { productId: string; quantity: number }[], note: string = '', attachment?: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: `t${Date.now()}`,
      type: 'DISTRIBUTION',
      studentId,
      items,
      note,
      attachment,
      date: new Date().toISOString(),
      recordedBy: currentUser.id,
    };
    setTransactions((prev) => [...prev, newTx]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newReceived = [...(s.receivedItems || [])];
          items.forEach(item => {
            const existing = newReceived.find(i => i.productId === item.productId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              newReceived.push({ ...item });
            }
          });
          const newTotal = newReceived.reduce((sum, i) => sum + i.quantity, 0);
          return { ...s, receivedItems: newReceived, itemsReceived: newTotal };
        }
        return s;
      })
    );

    setProducts((prev) =>
      prev.map((p) => {
        const found = items.find((i) => i.productId === p.id);
        if (found) {
          return { ...p, stock: p.stock - found.quantity };
        }
        return p;
      })
    );
    logAction('RECORD_DISTRIBUTION', `จ่ายสินค้าให้นักเรียน ID: ${studentId} จำนวน ${totalItems} ชิ้น`);
  };

  const updateProductStock = (productId: string, quantity: number, type: 'IN' | 'OUT') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = type === 'IN' ? p.stock + quantity : p.stock - quantity;
          const newInitialStock = type === 'IN' ? (p.initialStock || p.stock) + quantity : (p.initialStock || p.stock) - quantity;
          return { ...p, stock: newStock, initialStock: newInitialStock };
        }
        return p;
      })
    );
    logAction('UPDATE_STOCK', `ปรับปรุงสต๊อกสินค้า ID: ${productId} (${type === 'IN' ? '+' : '-'}${quantity})`);
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'paidAmount' | 'itemsReceived'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `s${Date.now()}`,
      paidAmount: 0,
      itemsReceived: 0,
    };
    setStudents((prev) => [...prev, newStudent]);
    logAction('ADD_STUDENT', `เพิ่มข้อมูลนักเรียนรหัส: ${studentData.studentId}`);
  };

  const updateStudent = (studentId: string, data: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...data } : s));
    logAction('UPDATE_STUDENT', `แก้ไขข้อมูลนักเรียนรหัส/ID: ${studentId}`);
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    logAction('DELETE_STUDENT', `ลบข้อมูลนักเรียน ID: ${studentId}`);
  };

  const updateProduct = (productId: string, data: Partial<Product>, note: string = ''): StockHistoryItem | null => {
    let historyItem: StockHistoryItem | null = null;
    const currentProduct = products.find((p) => p.id === productId);

    if (currentProduct) {
      const oldStock = Number(currentProduct.stock);
      const newStock = data.stock !== undefined ? Number(data.stock) : oldStock;
      const diff = newStock - oldStock;

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear() + 543;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const dateStr = `${day}/${month}/${year}`;
      const timeStr = `${hours}:${minutes} น.`;

      let actionText = '';
      if (diff > 0) {
        actionText = `วันที่ ${dateStr} เวลา ${timeStr} ได้เพิ่มรายการสต๊อก จาก ${oldStock} เป็น ${newStock} ชิ้น`;
      } else if (diff < 0) {
        actionText = `วันที่ ${dateStr} เวลา ${timeStr} ได้ปรับลดรายการสต๊อก จาก ${oldStock} เป็น ${newStock} ชิ้น`;
      } else {
        actionText = `วันที่ ${dateStr} เวลา ${timeStr} ได้แก้ไขข้อมูลสินค้า (สต๊อกคงเดิม ${oldStock} ชิ้น)`;
      }

      historyItem = {
        id: `sh_${Date.now()}`,
        productId,
        productCode: data.code || currentProduct.code,
        productName: data.name || currentProduct.name,
        category: data.category || currentProduct.category,
        size: data.size || currentProduct.size,
        color: data.color || currentProduct.color,
        oldStock,
        newStock,
        diff,
        actionText,
        formattedDate: dateStr,
        formattedTime: timeStr,
        timestamp: now.toISOString(),
        recordedBy: currentUser?.id || 'admin',
        recorderName: currentUser?.name || 'ผู้ดูแลระบบ',
        note: note.trim() ? note.trim() : undefined,
      };

      setStockHistory((prev) => [historyItem!, ...prev]);
      logAction('UPDATE_PRODUCT_STOCK', `${historyItem.actionText} [${historyItem.productCode} - ${historyItem.productName}]`);

      // If stock increased, automatically record a STOCK_IN transaction so it links to the Reports page
      if (diff > 0) {
        const stockInTx: Transaction = {
          id: `t_stockin_${Date.now()}`,
          type: 'STOCK_IN',
          items: [{ productId, quantity: diff }],
          note: note.trim() || `รับเข้าสต๊อกสินค้า: ${currentProduct.name} (${currentProduct.code}) เพิ่ม ${diff} ชิ้น (จาก ${oldStock} เป็น ${newStock} ชิ้น)`,
          date: now.toISOString(),
          recordedBy: currentUser?.id || 'admin',
        };
        setTransactions((prev) => [stockInTx, ...prev]);
      }
    }

    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...data } : p)));
    return historyItem;
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
    
    // Auto-create a STOCK_IN transaction if initial stock > 0 for complete linkage with Reports
    const initialQty = Number(newProduct.stock) || 0;
    if (initialQty > 0) {
      const stockInTx: Transaction = {
        id: `t_stockin_${Date.now()}`,
        type: 'STOCK_IN',
        items: [{ productId: newProduct.id, quantity: initialQty }],
        note: `เพิ่มสินค้าใหม่และรับเข้าสต๊อกเริ่มต้น: ${newProduct.name} (${newProduct.code}) จำนวน ${initialQty} ชิ้น`,
        date: new Date().toISOString(),
        recordedBy: currentUser?.id || 'admin',
      };
      setTransactions((prev) => [stockInTx, ...prev]);

      // Also record in stock history
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear() + 543;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dateStr = `${day}/${month}/${year}`;
      const timeStr = `${hours}:${minutes} น.`;

      const historyItem: StockHistoryItem = {
        id: `sh_${Date.now()}`,
        productId: newProduct.id,
        productCode: newProduct.code,
        productName: newProduct.name,
        category: newProduct.category,
        size: newProduct.size,
        color: newProduct.color,
        oldStock: 0,
        newStock: initialQty,
        diff: initialQty,
        actionText: `วันที่ ${dateStr} เวลา ${timeStr} ได้เพิ่มสินค้าใหม่พร้อมสต๊อกเริ่มต้น ${initialQty} ชิ้น`,
        formattedDate: dateStr,
        formattedTime: timeStr,
        timestamp: now.toISOString(),
        recordedBy: currentUser?.id || 'admin',
        recorderName: currentUser?.name || 'ผู้ดูแลระบบ',
        note: 'สต๊อกเริ่มต้นตอนสร้างสินค้าใหม่',
      };
      setStockHistory((prev) => [historyItem, ...prev]);
    }

    logAction('ADD_PRODUCT', `เพิ่มสินค้าใหม่: ${productData.code} (สต๊อกเริ่มต้น ${initialQty} ชิ้น)`);
  };

  const recordStockIn = (productId: string, quantity: number, note: string = '') => {
    if (quantity <= 0) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const oldStock = Number(prod.stock) || 0;
    const newStock = oldStock + quantity;

    updateProduct(productId, { stock: newStock }, note || `รับเข้าสต๊อกสินค้า ${quantity} ชิ้น`);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    logAction('DELETE_PRODUCT', `ลบสินค้า ID: ${productId}`);
  };

  const addSemester = (semData: Omit<Semester, 'id'>) => {
    const newSem: Semester = {
      ...semData,
      id: `sem_${Date.now()}`,
    };
    if (newSem.isActive) {
      setSemesters(prev => [newSem, ...prev.map(s => ({ ...s, isActive: false }))]);
    } else {
      setSemesters(prev => [newSem, ...prev]);
    }
    logAction('ADD_SEMESTER', `เพิ่มภาคเรียน: ${semData.name}`);
  };

  const updateSemester = (id: string, data: Partial<Semester>) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...data };
      }
      if (data.isActive) {
        return { ...s, isActive: false };
      }
      return s;
    }));
    logAction('UPDATE_SEMESTER', `แก้ไขภาคเรียน ID: ${id}`);
  };

  const deleteSemester = (id: string) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_SEMESTER', `ลบภาคเรียน ID: ${id}`);
  };

  const setActiveSemester = (id: string) => {
    setSemesters(prev => prev.map(s => ({
      ...s,
      isActive: s.id === id,
      status: s.id === id ? 'ACTIVE' : s.status === 'ACTIVE' ? 'CLOSED' : s.status,
    })));
    const target = semesters.find(s => s.id === id);
    logAction('SET_ACTIVE_SEMESTER', `กำหนดภาคเรียนปัจจุบัน: ${target?.name || id}`);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `u${Date.now()}` };
    setUsersState(prev => [...prev, newUser]);
    logAction('ADD_USER', `เพิ่มผู้ใช้งานใหม่: ${userData.username}`);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsersState(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u };
        (Object.keys(data) as (keyof User)[]).forEach(key => {
          if (data[key] !== undefined && data[key] !== '') {
            (updated as any)[key] = data[key];
          } else if (data[key] !== undefined && key !== 'password') {
            (updated as any)[key] = data[key];
          }
        });
        return updated;
      }
      return u;
    }));
    logAction('UPDATE_USER', `แก้ไขข้อมูลผู้ใช้งาน ID: ${userId}`);
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
    }
  };

  const changeUserPassword = (userId: string, newPassword: string, forceChange: boolean = false) => {
    setUsersState(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, forcePasswordChange: forceChange } : u));
    const targetUser = users.find(u => u.id === userId);
    logAction('CHANGE_PASSWORD', `แอดมินได้เปลี่ยนรหัสผ่านสำหรับ ${targetUser?.name || targetUser?.username || userId} เรียบร้อยแล้ว`);
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword, forcePasswordChange: forceChange } : prev);
    }
  };

  const deleteUser = (userId: string) => {
    setUsersState(prev => prev.filter(u => u.id !== userId));
    logAction('DELETE_USER', `ลบผู้ใช้งาน ID: ${userId}`);
  };

  return (
    <StoreContext.Provider
      value={{
        mode,
        setMode,
        language,
        setLanguage,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        switchUser,
        users,
        students,
        products,
        transactions,
        auditLogs,
        stockHistory,
        semesters,
        currentSemester,
        recordPayment,
        recordDistribution,
        recordStockIn,
        updateProductStock,
        addStudent,
        updateStudent,
        deleteStudent,
        updateProduct,
        addProduct,
        deleteProduct,
        addUser,
        updateUser,
        deleteUser,
        changeUserPassword,
        addSemester,
        updateSemester,
        deleteSemester,
        setActiveSemester,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
