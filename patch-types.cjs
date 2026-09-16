const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  "  status: 'ACTIVE' | 'SUSPENDED';",
  "  status: 'ACTIVE' | 'SUSPENDED';\n  lastLoginAt?: any;\n  lastLogin?: string;"
);

fs.writeFileSync('src/types.ts', content, 'utf8');
