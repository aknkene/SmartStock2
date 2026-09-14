const fs = require('fs');

let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// We have two places where stock history is updated. Let's write a helper function to set stock history correctly.

content = content.replace(
  'const setUsersState = mode === \'DEMO\' ? setDemoUsers : setProdUsers;',
  'const setUsersState = mode === \'DEMO\' ? setDemoUsers : setProdUsers;\n  const setStockHistoryState = mode === \'DEMO\' ? setDemoStockHistory : setProdStockHistory;'
);

// Fix the broken replacements
content = content.replace(
  /mode === "DEMO" \? setDemoStockHistory\(prev => typeof prev === "function" \? \(prev as any\)\(\) : prev\) : setProdStockHistory\(\(prev\) => \[historyItem!, \.\.\.prev\]\);/g,
  'setStockHistoryState(prev => [historyItem!, ...prev]);'
);

content = content.replace(
  /mode === "DEMO" \? setDemoStockHistory\(prev => typeof prev === "function" \? \(prev as any\)\(\) : prev\) : setProdStockHistory\(\(prev\) => \[historyItem, \.\.\.prev\]\);/g,
  'setStockHistoryState(prev => [historyItem, ...prev]);'
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
