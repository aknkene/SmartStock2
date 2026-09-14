const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const importsToAdd = `
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
`;

if (!content.includes('import { db }')) {
  content = content.replace("import React, { createContext, useContext, useState, ReactNode", importsToAdd + "import React, { createContext, useContext, useState, ReactNode, useEffect");
}

// Replace the prod states initialization with Firebase listeners inside an effect
const useEffectCode = `
  useEffect(() => {
    if (mode === 'PRODUCTION') {
      const unsubs: any[] = [];
      unsubs.push(onSnapshot(collection(db, 'users'), (snapshot) => {
        setProdUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
      }));
      unsubs.push(onSnapshot(collection(db, 'students'), (snapshot) => {
        setProdStudents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student)));
      }));
      unsubs.push(onSnapshot(collection(db, 'products'), (snapshot) => {
        setProdProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
      }));
      unsubs.push(onSnapshot(collection(db, 'transactions'), (snapshot) => {
        setProdTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction)));
      }));
      unsubs.push(onSnapshot(collection(db, 'stockHistory'), (snapshot) => {
        setProdStockHistory(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StockHistoryItem)));
      }));
      unsubs.push(onSnapshot(collection(db, 'semesters'), (snapshot) => {
        setSemesters(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Semester)));
      }));
      unsubs.push(onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
        setAuditLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditLog)));
      }));
      return () => {
        unsubs.forEach(unsub => unsub());
      };
    }
  }, [mode]);
`;

if (!content.includes('collection(db, \'users\')')) {
  content = content.replace(
    "const currentSemester = semesters.find(s => s.isActive) || semesters[0];",
    "const currentSemester = semesters.find(s => s.isActive) || semesters[0];\n" + useEffectCode
  );
}

// We need a helper to safely write to firestore or local state
const helperCode = `
  const writeToDb = async (collectionName: string, id: string, data: any) => {
    if (mode === 'PRODUCTION') {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    }
  };
  const deleteFromDb = async (collectionName: string, id: string) => {
    if (mode === 'PRODUCTION') {
      await deleteDoc(doc(db, collectionName, id));
    }
  };
`;

if (!content.includes('writeToDb')) {
  content = content.replace(
    "const logAction = (action: string, details: string) => {",
    helperCode + "\n  const logAction = (action: string, details: string) => {"
  );
}

// Modify logAction
content = content.replace(
  /const newLog: AuditLog = \{\s*id: `log_\$\{Date.now\(\)\}`,[\s\S]*?userId: currentUser\?.id \|\| 'system',\s*userName: currentUser\?.name \|\| 'System',\s*\};\s*setAuditLogs\(\(prev\) => \[newLog, ...prev\]\);/,
  `const newLog: AuditLog = {
      id: \`log_\${Date.now()}\`,
      action,
      details,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
    };
    if (mode === 'PRODUCTION') {
      writeToDb('auditLogs', newLog.id, newLog);
    } else {
      setAuditLogs((prev) => [newLog, ...prev]);
    }`
);

// recordPayment
content = content.replace(
  /setTransactions\(\(prev\) => \[tx, \.\.\.prev\]\);/,
  `if (mode === 'PRODUCTION') { writeToDb('transactions', tx.id, tx); } else { setTransactions((prev) => [tx, ...prev]); }`
);
content = content.replace(
  /setStudents\(\(prev\) =>\s*prev\.map\(\(s\) =>\s*s\.id === studentId \? \{ \.\.\.s, paidAmount: \(Number\(s\.paidAmount\) \|\| 0\) \+ amount \} : s\s*\)\s*\);/,
  `const student = students.find(s => s.id === studentId);
    if (student) {
      if (mode === 'PRODUCTION') {
        writeToDb('students', student.id, { paidAmount: (Number(student.paidAmount) || 0) + amount });
      } else {
        setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, paidAmount: (Number(s.paidAmount) || 0) + amount } : s));
      }
    }`
);

// recordDistribution
content = content.replace(
  /setTransactions\(\(prev\) => \[tx, \.\.\.prev\]\);/g,
  `if (mode === 'PRODUCTION') { writeToDb('transactions', tx.id, tx); } else { setTransactions((prev) => [tx, ...prev]); }`
);

content = content.replace(
  /setProducts\(\(prev\) =>\s*prev\.map\(\(p\) => \{\s*const item = items\.find\(\(i\) => i\.productId === p\.id\);\s*if \(item\) \{\s*return \{ \.\.\.p, stock: Number\(p\.stock\) - item\.quantity \};\s*\}\s*return p;\s*\}\)\s*\);/,
  `if (mode === 'PRODUCTION') {
      items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) writeToDb('products', prod.id, { stock: Number(prod.stock) - item.quantity });
      });
    } else {
      setProducts((prev) => prev.map((p) => {
        const item = items.find((i) => i.productId === p.id);
        if (item) { return { ...p, stock: Number(p.stock) - item.quantity }; }
        return p;
      }));
    }`
);

// updateProductStock
content = content.replace(
  /mode === "DEMO" \? setDemoStockHistory\(prev => typeof prev === "function" \? \(prev as any\)\(\) : prev\) : setStockHistoryState\(prev => \[historyItem!, \.\.\.prev\]\);/,
  `if (mode === 'PRODUCTION') { writeToDb('stockHistory', historyItem!.id, historyItem); } else { setDemoStockHistory(prev => [historyItem!, ...prev]); }`
);

// addProduct
content = content.replace(
  /setProducts\(\(prev\) => \[\.\.\.prev, newProduct\]\);/,
  `if (mode === 'PRODUCTION') { writeToDb('products', newProduct.id, newProduct); } else { setProducts((prev) => [...prev, newProduct]); }`
);
content = content.replace(
  /setStockHistoryState\(prev => \[historyItem, \.\.\.prev\]\);/,
  `if (mode === 'PRODUCTION') { writeToDb('stockHistory', historyItem.id, historyItem); } else { setDemoStockHistory(prev => [historyItem, ...prev]); }`
);

// updateProduct
content = content.replace(
  /setProducts\(\(prev\) => prev\.map\(\(p\) => \(p\.id === productId \? \{ \.\.\.p, \.\.\.data \} : p\)\)\);/,
  `if (mode === 'PRODUCTION') { writeToDb('products', productId, data); } else { setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...data } : p))); }`
);

// deleteProduct
content = content.replace(
  /setProducts\(prev => prev\.filter\(p => p\.id !== productId\)\);/,
  `if (mode === 'PRODUCTION') { deleteFromDb('products', productId); } else { setProducts(prev => prev.filter(p => p.id !== productId)); }`
);

// addStudent
content = content.replace(
  /setStudents\(\(prev\) => \[\.\.\.prev, newStudent\]\);/,
  `if (mode === 'PRODUCTION') { writeToDb('students', newStudent.id, newStudent); } else { setStudents((prev) => [...prev, newStudent]); }`
);

// updateStudent
content = content.replace(
  /setStudents\(\(prev\) => prev\.map\(\(s\) => \(s\.id === studentId \? \{ \.\.\.s, \.\.\.data \} : s\)\)\);/,
  `if (mode === 'PRODUCTION') { writeToDb('students', studentId, data); } else { setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...data } : s))); }`
);

// deleteStudent
content = content.replace(
  /setStudents\(prev => prev\.filter\(s => s\.id !== studentId\)\);/,
  `if (mode === 'PRODUCTION') { deleteFromDb('students', studentId); } else { setStudents(prev => prev.filter(s => s.id !== studentId)); }`
);

// addUser
content = content.replace(
  /setUsersState\(prev => \[\.\.\.prev, newUser\]\);/,
  `if (mode === 'PRODUCTION') { writeToDb('users', newUser.id, newUser); } else { setDemoUsers(prev => [...prev, newUser]); }`
);

// deleteUser
content = content.replace(
  /setUsersState\(prev => prev\.filter\(u => u\.id !== userId\)\);/,
  `if (mode === 'PRODUCTION') { deleteFromDb('users', userId); } else { setDemoUsers(prev => prev.filter(u => u.id !== userId)); }`
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
