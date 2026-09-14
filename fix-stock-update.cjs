const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetStr = `  const updateProductStock = (productId: string, quantity: number, type: 'IN' | 'OUT') => {
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
    logAction('UPDATE_STOCK', \`ปรับปรุงสต๊อกสินค้า ID: \${productId} (\${type === 'IN' ? '+' : '-'}\${quantity})\`);
  };`;

const replacement = `  const updateProductStock = (productId: string, quantity: number, type: 'IN' | 'OUT') => {
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

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
