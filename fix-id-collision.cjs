const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// Replace Date.now() with Date.now() + Math.random().toString(36).substr(2, 5) for IDs
content = content.replace(/id: \`p\$\{Date.now\(\)\}\`/g, "id: `p${Date.now()}_${Math.random().toString(36).substr(2, 5)}`");
content = content.replace(/id: \`t_stockin_\$\{Date.now\(\)\}\`/g, "id: `t_stockin_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`");
content = content.replace(/id: \`sh_\$\{Date.now\(\)\}\`/g, "id: `sh_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`");
content = content.replace(/id: \`t\$\{Date.now\(\)\}\`/g, "id: `t${Date.now()}_${Math.random().toString(36).substr(2, 5)}`");

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
