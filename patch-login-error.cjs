const fs = require('fs');

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Remove default password hint
content = content.replace(
  '<span className="text-[11px] text-slate-400 font-mono">ค่าเริ่มต้น: 12345</span>',
  ''
);

// Add error display
const formStart = '<form onSubmit={handleLogin} className="space-y-4">';
const errorBlock = `
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">`;

content = content.replace(formStart, errorBlock);

fs.writeFileSync('src/pages/Login.tsx', content, 'utf8');
