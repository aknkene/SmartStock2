const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetPayment = `  const recordPayment = (studentId: string, amount: number, note: string, attachment?: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: \`t\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`,
      type: 'PAYMENT',
      studentId,
      amount,
      note,
      attachment,
      date: new Date().toISOString(),
      recordedBy: currentUser.id,
    };
    if (mode === 'PRODUCTION') {
      writeToDb('transactions', newTx.id, newTx);
      const student = students.find(s => s.id === studentId);
      if (student) {
        writeToDb('students', studentId, { paidAmount: (Number(student.paidAmount) || 0) + amount });
      }
    } else {
      setTransactions((prev) => [...prev, newTx]);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, paidAmount: s.paidAmount + amount } : s)));
    }
    logAction('RECORD_PAYMENT', \`รับชำระเงิน \${amount} บาท จากนักเรียน ID: \${studentId}\`);
  };`;

const newPayment = `  const recordPayment = async (studentId: string, amount: number, note: string, attachment?: string): Promise<void> => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: \`t\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`,
      type: 'PAYMENT',
      studentId,
      amount,
      note,
      attachment,
      date: new Date().toISOString(),
      recordedBy: currentUser.id,
    };
    if (mode === 'PRODUCTION') {
      await runTransaction(db, async (transaction) => {
        const studentRef = doc(db, 'students', studentId);
        const studentDoc = await transaction.get(studentRef);
        if (!studentDoc.exists()) {
          throw new Error("Student not found");
        }
        const sData = studentDoc.data() as Student;
        transaction.set(doc(db, 'transactions', newTx.id), newTx);
        transaction.update(studentRef, {
          paidAmount: (Number(sData.paidAmount) || 0) + amount
        });
      });
    } else {
      setTransactions((prev) => [...prev, newTx]);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, paidAmount: s.paidAmount + amount } : s)));
    }
    logAction('RECORD_PAYMENT', \`รับชำระเงิน \${amount} บาท จากนักเรียน ID: \${studentId}\`);
  };`;

content = content.replace(targetPayment, newPayment);

const targetDistribution = `  const recordDistribution = (studentId: string, items: { productId: string; quantity: number }[], note: string = '', attachment?: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: \`t\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`,
      type: 'DISTRIBUTION',
      studentId,
      items,
      note,
      attachment,
      date: new Date().toISOString(),
      recordedBy: currentUser.id,
    };
    if (mode === 'PRODUCTION') { writeToDb('transactions', newTx.id, newTx); } else { setTransactions((prev) => [...prev, newTx]); }

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
    logAction('RECORD_DISTRIBUTION', \`จ่ายสินค้าให้นักเรียน ID: \${studentId} จำนวน \${totalItems} ชิ้น\`);
  };`;

const newDistribution = `  const recordDistribution = async (studentId: string, items: { productId: string; quantity: number }[], note: string = '', attachment?: string): Promise<void> => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: \`t\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`,
      type: 'DISTRIBUTION',
      studentId,
      items,
      note,
      attachment,
      date: new Date().toISOString(),
      recordedBy: currentUser.id,
    };
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (mode === 'PRODUCTION') {
      await runTransaction(db, async (transaction) => {
        const productDocs = await Promise.all(
          items.map(item => transaction.get(doc(db, 'products', item.productId)))
        );
        
        productDocs.forEach((pDoc, index) => {
          if (!pDoc.exists()) {
            throw new Error(\`ไม่พบสินค้า \${items[index].productId}\`);
          }
          const pData = pDoc.data() as Product;
          if (pData.stock < items[index].quantity) {
            throw new Error(\`สินค้า \${pData.name} มีสต๊อกไม่พอ (ต้องการ: \${items[index].quantity}, มีอยู่: \${pData.stock})\`);
          }
        });

        const studentDoc = await transaction.get(doc(db, 'students', studentId));
        if (!studentDoc.exists()) {
          throw new Error(\`ไม่พบนักเรียน \${studentId}\`);
        }

        transaction.set(doc(db, 'transactions', newTx.id), newTx);

        items.forEach((item, index) => {
          const pData = productDocs[index].data() as Product;
          transaction.update(doc(db, 'products', item.productId), {
            stock: pData.stock - item.quantity
          });
        });

        const sData = studentDoc.data() as Student;
        const newReceived = [...(sData.receivedItems || [])];
        items.forEach(item => {
          const existing = newReceived.find(i => i.productId === item.productId);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            newReceived.push({ ...item });
          }
        });
        const newTotal = newReceived.reduce((sum, i) => sum + i.quantity, 0);
        
        transaction.update(doc(db, 'students', studentId), {
          receivedItems: newReceived,
          itemsReceived: newTotal
        });
      });
    } else {
      // Demo mode checks
      for (const item of items) {
        const p = products.find(prod => prod.id === item.productId);
        if (!p) throw new Error(\`ไม่พบสินค้า \${item.productId}\`);
        if (p.stock < item.quantity) throw new Error(\`สินค้า \${p.name} มีสต๊อกไม่พอ\`);
      }
      
      setTransactions((prev) => [...prev, newTx]);
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
    }
    logAction('RECORD_DISTRIBUTION', \`จ่ายสินค้าให้นักเรียน ID: \${studentId} จำนวน \${totalItems} ชิ้น\`);
  };`;

content = content.replace(targetDistribution, newDistribution);
fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
