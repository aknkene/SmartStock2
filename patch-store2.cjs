const fs = require('fs');

let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// Separate stockHistory for DEMO and PROD
if (!content.includes('const [prodStockHistory')) {
  content = content.replace(
    'const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>(mockStockHistory);',
    'const [demoStockHistory, setDemoStockHistory] = useState<StockHistoryItem[]>(mockStockHistory);\n  const [prodStockHistory, setProdStockHistory] = useState<StockHistoryItem[]>([]);'
  );
  
  content = content.replace(
    'const products = mode === \'DEMO\' ? demoProducts : prodProducts;',
    'const products = mode === \'DEMO\' ? demoProducts : prodProducts;\n  const stockHistory = mode === \'DEMO\' ? demoStockHistory : prodStockHistory;'
  );

  content = content.replace(
    /setStockHistory\(/g,
    'mode === "DEMO" ? setDemoStockHistory(prev => typeof prev === "function" ? (prev as any)() : prev) : setProdStockHistory('
  );
  // Actually, replacing setStockHistory directly might be tricky due to how it's used.
  // Let's just find the occurrences and fix them properly.
}
fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
