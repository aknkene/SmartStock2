const fs = require('fs');

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Remove Info Callout
content = content.replace(/{\/\* Info callout for default password \*\/}[\s\S]*?{\/\* Quick Demo Selector \*\/}/, '{/* Quick Demo Selector */}');

// Remove Quick Demo Selector
content = content.replace(/{\/\* Quick Demo Selector \*\/}[\s\S]*?<form onSubmit={handleLogin}/, '<form onSubmit={handleLogin}');

fs.writeFileSync('src/pages/Login.tsx', content, 'utf8');
