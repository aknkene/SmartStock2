const fs = require('fs');

let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// The replacement logic:
const oldSwitch = `{/* Direct Switch to Staff / Admin button */}
          {isAdmin ? (
            <button
              onClick={() => switchUser('STAFF')}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title="สลับไปดูหน้าต่างและการทำงานของเจ้าหน้าที่ (Staff)"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{t('header.viewStaff')}</span>
            </button>
          ) : (
            <button
              onClick={() => switchUser('ADMIN')}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              title="สลับกลับไปหน้าต่างผู้ดูแลระบบ (Admin) เพื่อจัดการระบบหรือเปลี่ยนรหัสผ่าน"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{t('header.viewAdmin')}</span>
            </button>
          )}`;

const newSwitch = `{/* Direct Switch to Staff / Admin button - Only original admins can see this */}
          {originalUser?.role === 'ADMIN' && (
            isAdmin ? (
              <button
                onClick={() => switchUser('STAFF')}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
                title="สลับไปดูหน้าต่างและการทำงานของเจ้าหน้าที่ (Staff)"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>{t('header.viewStaff')}</span>
              </button>
            ) : (
              <button
                onClick={() => switchUser('ADMIN')}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
                title="สลับกลับไปหน้าต่างผู้ดูแลระบบ (Admin) เพื่อจัดการระบบหรือเปลี่ยนรหัสผ่าน"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>{t('header.viewAdmin')}</span>
              </button>
            )
          )}`;

content = content.replace(oldSwitch, newSwitch);

fs.writeFileSync('src/components/Header.tsx', content, 'utf8');
