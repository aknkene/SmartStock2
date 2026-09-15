const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetUpdateStock = `  const updateProductStock = (productId: string, quantity: number, type: 'IN' | 'OUT') => {
    if (mode === 'PRODUCTION') {
      const p = products.find(prod => prod.id === productId);
      if (p) {
        const newStock = type === 'IN' ? p.stock + quantity : p.stock - quantity;
        const newInitialStock = type === 'IN' ? (p.initialStock || p.stock) + quantity : (p.initialStock || p.stock) - quantity;
        writeToDb('products', productId, { stock: newStock, initialStock: newInitialStock });
      }
    } else {
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
    }
    logAction('UPDATE_STOCK', \`ปรับปรุงสต๊อกสินค้า ID: \${productId} (\${type === 'IN' ? '+' : '-'}\${quantity})\`);
  };`;

const newUpdateStock = `  const updateProductStock = async (productId: string, quantity: number, type: 'IN' | 'OUT') => {
    if (mode === 'PRODUCTION') {
      try {
        await runTransaction(db, async (transaction) => {
          const productRef = doc(db, 'products', productId);
          const pDoc = await transaction.get(productRef);
          if (!pDoc.exists()) {
            throw new Error("ไม่พบสินค้า");
          }
          const p = pDoc.data() as Product;
          const newStock = type === 'IN' ? p.stock + quantity : p.stock - quantity;
          if (newStock < 0) {
            throw new Error("สต๊อกไม่เพียงพอ");
          }
          const newInitialStock = type === 'IN' ? (p.initialStock || p.stock) + quantity : (p.initialStock || p.stock) - quantity;
          transaction.update(productRef, { stock: newStock, initialStock: newInitialStock });
        });
      } catch (e: any) {
        console.error("Failed to update stock:", e);
        throw e;
      }
    } else {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const newStock = type === 'IN' ? p.stock + quantity : p.stock - quantity;
            if (newStock < 0) {
              throw new Error("สต๊อกไม่เพียงพอ");
            }
            const newInitialStock = type === 'IN' ? (p.initialStock || p.stock) + quantity : (p.initialStock || p.stock) - quantity;
            return { ...p, stock: newStock, initialStock: newInitialStock };
          }
          return p;
        })
      );
    }
    logAction('UPDATE_STOCK', \`ปรับปรุงสต๊อกสินค้า ID: \${productId} (\${type === 'IN' ? '+' : '-'}\${quantity})\`);
  };`;

content = content.replace(targetUpdateStock, newUpdateStock);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
