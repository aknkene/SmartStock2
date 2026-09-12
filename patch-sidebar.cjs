const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const oldBtn = `<button
          onClick={() => switchUser(isStaff ? 'ADMIN' : 'STAFF')}
          className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
        >
          <span>{isStaff ? t('sidebar.switchAdmin') : t('sidebar.switchStaff')}</span>
        </button>`;

const newBtn = `{originalUser?.role === 'ADMIN' && (
          <button
            onClick={() => switchUser(isStaff ? 'ADMIN' : 'STAFF')}
            className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <span>{isStaff ? t('sidebar.switchAdmin') : t('sidebar.switchStaff')}</span>
          </button>
        )}`;

content = content.replace(oldBtn, newBtn);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
