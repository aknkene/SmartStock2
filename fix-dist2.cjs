const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetStr = `    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
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
    );`;

const replacement = `    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (mode === 'PRODUCTION') {
      const student = students.find(s => s.id === studentId);
      if (student) {
        const newReceived = [...(student.receivedItems || [])];
        items.forEach(item => {
          const existing = newReceived.find(i => i.productId === item.productId);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            newReceived.push({ ...item });
          }
        });
        const newTotal = newReceived.reduce((sum, i) => sum + i.quantity, 0);
        writeToDb('students', studentId, { receivedItems: newReceived, itemsReceived: newTotal });
      }
      items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          writeToDb('products', prod.id, { stock: Number(prod.stock) - item.quantity });
        }
      });
    } else {
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
    }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
