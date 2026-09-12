export type Role = 'ADMIN' | 'STAFF' | 'EXECUTIVE';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  managedRoom?: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin?: string;
  startDate?: string;
  endDate?: string;
  forcePasswordChange?: boolean;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  level: string;
  room: string;
  department: string;
  totalFee: number;
  paidAmount: number;
  itemsRequired: number;
  itemsReceived: number;
  orderedItems?: { productId: string; quantity: number }[];
  receivedItems?: { productId: string; quantity: number }[];
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  size: string;
  color: string;
  costPrice?: number;
  price: number;
  stock: number;
  initialStock?: number;
  minStock: number;
}

export interface Transaction {
  id: string;
  type: 'PAYMENT' | 'DISTRIBUTION' | 'STOCK_IN' | 'RETURN';
  studentId?: string;
  amount?: number;
  items?: { productId: string; quantity: number }[];
  date: string;
  recordedBy: string;
  note?: string;
  attachment?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  timestamp: string;
  mode: 'DEMO' | 'PRODUCTION';
}

export interface StockHistoryItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  category?: string;
  size?: string;
  color?: string;
  oldStock: number;
  newStock: number;
  diff: number;
  actionText: string; // e.g. "วันที่ 12/09/2567 เวลา 15:30 น. ได้เพิ่มรายการสต๊อกจาก 15 เป็น 25 ชิ้น"
  formattedDate: string;
  formattedTime: string;
  timestamp: string;
  recordedBy: string;
  recorderName?: string;
  note?: string;
}

