const fs = require('fs');

let content = fs.readFileSync('src/pages/Users.tsx', 'utf8');

const oldBtn = `<button
            onClick={() => switchUser('ADMIN')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>สลับเป็นมุมมองแอดมิน (Admin) เพื่อเปลี่ยนรหัสผ่าน</span>
          </button>`;

const newBtn = `{originalUser?.role === 'ADMIN' && (
            <button
              onClick={() => switchUser('ADMIN')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>สลับเป็นมุมมองแอดมิน (Admin) เพื่อเปลี่ยนรหัสผ่าน</span>
            </button>
          )}`;

content = content.replace(oldBtn, newBtn);
fs.writeFileSync('src/pages/Users.tsx', content, 'utf8');
