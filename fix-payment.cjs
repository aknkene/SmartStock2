const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetStr = `    if (mode === 'PRODUCTION') {
      writeToDb('transactions', newTx.id, newTx);
      const student = students.find(s => s.id === studentId);
      if (student) {
        writeToDb('students', studentId, { paidAmount: (Number(student.paidAmount) || 0) + amount });
      }
    } else {
      if (mode === 'PRODUCTION') { writeToDb('transactions', newTx.id, newTx); } else { setTransactions((prev) => [...prev, newTx]); }
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, paidAmount: s.paidAmount + amount } : s)));
    }`;

const replacement = `    if (mode === 'PRODUCTION') {
      writeToDb('transactions', newTx.id, newTx);
      const student = students.find(s => s.id === studentId);
      if (student) {
        writeToDb('students', studentId, { paidAmount: (Number(student.paidAmount) || 0) + amount });
      }
    } else {
      setTransactions((prev) => [...prev, newTx]);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, paidAmount: s.paidAmount + amount } : s)));
    }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
