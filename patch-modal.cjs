const fs = require('fs');

let content = fs.readFileSync('src/components/ChangePasswordModal.tsx', 'utf8');

content = content.replace(
  'const { currentUser, updateUser } = useStore();',
  'const { currentUser, changeUserPassword } = useStore();'
);

content = content.replace(
  'updateUser(currentUser.id, { \n      password: newPassword, \n      forcePasswordChange: false \n    });',
  'changeUserPassword(currentUser.id, newPassword, false);'
);

fs.writeFileSync('src/components/ChangePasswordModal.tsx', content, 'utf8');
