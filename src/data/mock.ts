import { Product, Student, User, Transaction, StockHistoryItem, Semester } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', username: 'admin', password: '12345', name: 'ผู้ดูแลระบบ', firstName: 'สมศักดิ์', lastName: 'แอดมิน', email: 'admin@unistock.com', department: 'ส่วนกลาง', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'u2', username: 'staff01', password: '12345', name: 'สมชาย ใจดี (เจ้าหน้าที่)', firstName: 'สมชาย', lastName: 'ใจดี', email: 'staff@unistock.com', department: 'พัสดุและการเงิน', role: 'STAFF', status: 'ACTIVE' },
  { id: 'u3', username: 'exec01', password: '12345', name: 'ผอ. วิทยาลัย', firstName: 'อำนาจ', lastName: 'เจริญ', email: 'exec@unistock.com', department: 'บริหาร', role: 'EXECUTIVE', status: 'ACTIVE' },
];

export const mockProducts: Product[] = [
  { id: 'p1', code: 'SHIRT-M-WHT', name: 'เสื้อนักศึกษา (ชาย)', category: 'เสื้อ', size: 'M', color: 'ขาว', costPrice: 150, price: 250, stock: 150, initialStock: 200, minStock: 20 },
  { id: 'p2', code: 'SHIRT-L-WHT', name: 'เสื้อนักศึกษา (ชาย)', category: 'เสื้อ', size: 'L', color: 'ขาว', costPrice: 150, price: 250, stock: 15, initialStock: 50, minStock: 20 },
  { id: 'p3', code: 'PANTS-32-NVY', name: 'กางเกงนักศึกษา', category: 'กางเกง', size: '32', color: 'กรมท่า', costPrice: 200, price: 350, stock: 100, initialStock: 120, minStock: 15 },
  { id: 'p4', code: 'BELT-01', name: 'เข็มขัดพร้อมหัว', category: 'อุปกรณ์', size: 'Free Size', color: 'ดำ', costPrice: 80, price: 150, stock: 50, initialStock: 100, minStock: 10 },
  { id: 'p5', code: 'TIE-01', name: 'เนคไท', category: 'อุปกรณ์', size: 'Free Size', color: 'กรมท่า', costPrice: 50, price: 80, stock: 8, initialStock: 30, minStock: 15 },
];

export const mockStudents: Student[] = [
  { 
    id: 's1', studentId: '6601001', firstName: 'กฤษดา', lastName: 'รักเรียน', level: 'ปวช. 1', room: '1/1', department: 'ช่างยนต์', 
    totalFee: 1500, paidAmount: 1500, itemsRequired: 5, itemsReceived: 5,
    orderedItems: [{ productId: 'p1', quantity: 2 }, { productId: 'p3', quantity: 2 }, { productId: 'p4', quantity: 1 }],
    receivedItems: [{ productId: 'p1', quantity: 2 }, { productId: 'p3', quantity: 2 }, { productId: 'p4', quantity: 1 }]
  },
  { 
    id: 's2', studentId: '6601002', firstName: 'ขจรศักดิ์', lastName: 'ขยันยิ่ง', level: 'ปวช. 1', room: '1/1', department: 'ช่างยนต์', 
    totalFee: 1500, paidAmount: 500, itemsRequired: 5, itemsReceived: 2,
    orderedItems: [{ productId: 'p1', quantity: 2 }, { productId: 'p3', quantity: 2 }, { productId: 'p4', quantity: 1 }],
    receivedItems: [{ productId: 'p1', quantity: 2 }]
  },
  { 
    id: 's3', studentId: '6602001', firstName: 'จิดาภา', lastName: 'ใจใส', level: 'ปวช. 1', room: '1/2', department: 'บัญชี', 
    totalFee: 1200, paidAmount: 0, itemsRequired: 4, itemsReceived: 0,
    orderedItems: [{ productId: 'p2', quantity: 2 }, { productId: 'p3', quantity: 1 }, { productId: 'p5', quantity: 1 }],
    receivedItems: []
  },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', type: 'PAYMENT', studentId: 's1', amount: 1500, date: '2023-05-01T10:00:00Z', recordedBy: 'u3' },
  { id: 't2', type: 'DISTRIBUTION', studentId: 's1', items: [{ productId: 'p1', quantity: 2 }, { productId: 'p3', quantity: 2 }, { productId: 'p4', quantity: 1 }], date: '2023-05-02T14:30:00Z', recordedBy: 'u2' },
  { id: 't3', type: 'PAYMENT', studentId: 's2', amount: 500, date: '2023-05-03T09:15:00Z', recordedBy: 'u3' },
  { 
    id: 't_stock_1', 
    type: 'STOCK_IN', 
    items: [
      { productId: 'p1', quantity: 50 },
      { productId: 'p2', quantity: 30 }
    ], 
    date: '2026-09-10T10:30:00.000Z', 
    recordedBy: 'u1', 
    note: 'รับเข้าสต๊อกล็อตแรก เสื้อนักศึกษาเปิดเทอม 1/2567' 
  },
  { 
    id: 't_stock_2', 
    type: 'STOCK_IN', 
    items: [
      { productId: 'p4', quantity: 20 },
      { productId: 'p3', quantity: 40 }
    ], 
    date: '2026-09-08T14:15:00.000Z', 
    recordedBy: 'u1', 
    note: 'รับเข้าอุปกรณ์เข็มขัดและกางเกงจากผู้ผลิต' 
  },
];

export const mockSemesters: Semester[] = [
  {
    id: 'sem1',
    name: '1/2567',
    academicYear: '2567',
    term: '1',
    startDate: '2024-05-15',
    endDate: '2024-10-15',
    isActive: true,
    status: 'ACTIVE',
    note: 'ภาคเรียนที่ 1 ปีการศึกษา 2567 (ภาคเรียนปัจจุบัน)',
  },
  {
    id: 'sem2',
    name: '2/2566',
    academicYear: '2566',
    term: '2',
    startDate: '2023-11-01',
    endDate: '2024-03-31',
    isActive: false,
    status: 'CLOSED',
    note: 'ภาคเรียนที่ 2 ปีการศึกษา 2566 (สิ้นสุดแล้ว)',
  },
  {
    id: 'sem3',
    name: '1/2566',
    academicYear: '2566',
    term: '1',
    startDate: '2023-05-15',
    endDate: '2023-10-15',
    isActive: false,
    status: 'CLOSED',
    note: 'ภาคเรียนที่ 1 ปีการศึกษา 2566 (สิ้นสุดแล้ว)',
  },
  {
    id: 'sem4',
    name: '2/2567',
    academicYear: '2567',
    term: '2',
    startDate: '2024-11-01',
    endDate: '2025-03-31',
    isActive: false,
    status: 'UPCOMING',
    note: 'ภาคเรียนที่ 2 ปีการศึกษา 2567 (เตรียมเปิด)',
  },
];

export const mockStockHistory: StockHistoryItem[] = [
  {
    id: 'sh1',
    productId: 'p1',
    productCode: 'SHIRT-M-WHT',
    productName: 'เสื้อนักศึกษา (ชาย)',
    category: 'เสื้อ',
    size: 'M',
    color: 'ขาว',
    oldStock: 100,
    newStock: 150,
    diff: 50,
    actionText: 'วันที่ 10/09/2567 เวลา 10:30 น. ได้เพิ่มรายการสต๊อกจาก 100 เป็น 150 ชิ้น',
    formattedDate: '10/09/2567',
    formattedTime: '10:30 น.',
    timestamp: '2026-09-10T10:30:00.000Z',
    recordedBy: 'u1',
    recorderName: 'สมศักดิ์ แอดมิน',
    note: 'รับสินค้าเข้าเพิ่มเติมสำหรับรอบเปิดเทอม',
  },
  {
    id: 'sh2',
    productId: 'p4',
    productCode: 'BELT-01',
    productName: 'เข็มขัดพร้อมหัว',
    category: 'อุปกรณ์',
    size: 'Free Size',
    color: 'ดำ',
    oldStock: 30,
    newStock: 50,
    diff: 20,
    actionText: 'วันที่ 08/09/2567 เวลา 14:15 น. ได้เพิ่มรายการสต๊อกจาก 30 เป็น 50 ชิ้น',
    formattedDate: '08/09/2567',
    formattedTime: '14:15 น.',
    timestamp: '2026-09-08T14:15:00.000Z',
    recordedBy: 'u1',
    recorderName: 'สมศักดิ์ แอดมิน',
    note: 'สั่งผลิตเพิ่มและจัดเก็บเข้าคลัง',
  },
  {
    id: 'sh3',
    productId: 'p5',
    productCode: 'TIE-01',
    productName: 'เนคไท',
    category: 'อุปกรณ์',
    size: 'Free Size',
    color: 'กรมท่า',
    oldStock: 15,
    newStock: 8,
    diff: -7,
    actionText: 'วันที่ 05/09/2567 เวลา 11:20 น. ได้ปรับลดรายการสต๊อกจาก 15 เป็น 8 ชิ้น',
    formattedDate: '05/09/2567',
    formattedTime: '11:20 น.',
    timestamp: '2026-09-05T11:20:00.000Z',
    recordedBy: 'u2',
    recorderName: 'สมชาย ใจดี',
    note: 'ปรับยอดตามผลตรวจนับสินค้าจริงชำรุด',
  },
];

