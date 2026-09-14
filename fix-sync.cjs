const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// 1. Fix recordPayment
content = content.replace(
  /setTransactions\(\(prev\) => \[\.\.\.prev, newTx\]\);\s*setStudents\(\(prev\) =>\s*prev\.map\(\(s\) => \(s\.id === studentId \? \{ \.\.\.s, paidAmount: s\.paidAmount \+ amount \} : s\)\)\s*\);/m,
  `if (mode === 'PRODUCTION') {
      writeToDb('transactions', newTx.id, newTx);
      const student = students.find(s => s.id === studentId);
      if (student) {
        writeToDb('students', studentId, { paidAmount: (Number(student.paidAmount) || 0) + amount });
      }
    } else {
      setTransactions((prev) => [...prev, newTx]);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, paidAmount: s.paidAmount + amount } : s)));
    }`
);

// 2. Fix recordDistribution
content = content.replace(
  /setTransactions\(\(prev\) => \[\.\.\.prev, newTx\]\);/g,
  `if (mode === 'PRODUCTION') { writeToDb('transactions', newTx.id, newTx); } else { setTransactions((prev) => [...prev, newTx]); }`
);

content = content.replace(
  /setStudents\(\(prev\) =>\s*prev\.map\(\(s\) => \{\s*if \(s\.id === studentId\) \{\s*const newReceived = \[\.\.\.\(s\.receivedItems \|\| \[\]\)\];\s*items\.forEach\(item => \{\s*const existing = newReceived\.find\(r => r\.productId === item\.productId\);\s*if \(existing\) \{\s*existing\.quantity \+= item\.quantity;\s*\} else \{\s*newReceived\.push\(\{ \.\.\.item \}\);\s*\}\s*\}\);\s*return \{ \.\.\.s, itemsReceived: \(s\.itemsReceived \|\| 0\) \+ totalItems, receivedItems: newReceived \};\s*\}\s*return s;\s*\}\)\s*\);/m,
  `if (mode === 'PRODUCTION') {
      const student = students.find(s => s.id === studentId);
      if (student) {
        const newReceived = [...(student.receivedItems || [])];
        items.forEach(item => {
          const existing = newReceived.find(r => r.productId === item.productId);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            newReceived.push({ ...item });
          }
        });
        writeToDb('students', studentId, { itemsReceived: (student.itemsReceived || 0) + totalItems, receivedItems: newReceived });
      }
    } else {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            const newReceived = [...(s.receivedItems || [])];
            items.forEach(item => {
              const existing = newReceived.find(r => r.productId === item.productId);
              if (existing) {
                existing.quantity += item.quantity;
              } else {
                newReceived.push({ ...item });
              }
            });
            return { ...s, itemsReceived: (s.itemsReceived || 0) + totalItems, receivedItems: newReceived };
          }
          return s;
        })
      );
    }`
);

content = content.replace(
  /setProducts\(\(prev\) =>\s*prev\.map\(\(p\) => \{\s*const item = items\.find\(\(i\) => i\.productId === p\.id\);\s*if \(item\) \{\s*return \{ \.\.\.p, stock: p\.stock - item\.quantity \};\s*\}\s*return p;\s*\}\)\s*\);/m,
  `if (mode === 'PRODUCTION') {
      items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) writeToDb('products', prod.id, { stock: Number(prod.stock) - item.quantity });
      });
    } else {
      setProducts((prev) =>
        prev.map((p) => {
          const item = items.find((i) => i.productId === p.id);
          if (item) {
            return { ...p, stock: p.stock - item.quantity };
          }
          return p;
        })
      );
    }`
);

// 3. Fix updateProduct
content = content.replace(
  /setStockHistoryState\(prev => \[historyItem!, \.\.\.prev\]\);/g,
  `if (mode === 'PRODUCTION') { writeToDb('stockHistory', historyItem!.id, historyItem); } else { setStockHistoryState(prev => [historyItem!, ...prev]); }`
);

content = content.replace(
  /setTransactions\(\(prev\) => \[stockInTx, \.\.\.prev\]\);/g,
  `if (mode === 'PRODUCTION') { writeToDb('transactions', stockInTx.id, stockInTx); } else { setTransactions((prev) => [stockInTx, ...prev]); }`
);

// 4. Fix updateStudent
content = content.replace(
  /setStudents\(prev => prev\.map\(s => s\.id === studentId \? \{ \.\.\.s, \.\.\.data \} : s\)\);/g,
  `if (mode === 'PRODUCTION') { writeToDb('students', studentId, data); } else { setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...data } : s)); }`
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
