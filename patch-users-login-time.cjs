const fs = require('fs');
let content = fs.readFileSync('src/pages/Users.tsx', 'utf8');

// Replace {user.lastLogin ? new Date(user.lastLogin).toLocaleString('th-TH') : 'ไม่เคยเข้าใช้งาน'}
// with {user.lastLoginAt ? (user.lastLoginAt.toDate ? user.lastLoginAt.toDate().toLocaleString('th-TH') : new Date(user.lastLoginAt).toLocaleString('th-TH')) : 'ไม่เคยเข้าใช้งาน'}
content = content.replace(
  "{user.lastLogin ? new Date(user.lastLogin).toLocaleString('th-TH') : 'ไม่เคยเข้าใช้งาน'}",
  "{user.lastLoginAt ? (user.lastLoginAt?.toDate ? user.lastLoginAt.toDate().toLocaleString('th-TH') : new Date(user.lastLoginAt).toLocaleString('th-TH')) : (user.lastLogin ? new Date(user.lastLogin).toLocaleString('th-TH') : 'ไม่เคยเข้าใช้งาน')}"
);

fs.writeFileSync('src/pages/Users.tsx', content, 'utf8');
