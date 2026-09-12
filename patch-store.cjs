const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

content = content.replace(
  "const [currentUser,\n        originalUser, setCurrentUser]",
  "const [currentUser, setCurrentUser]"
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
