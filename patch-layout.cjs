const fs = require('fs');

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  "import { Login } from '../pages/Login';",
  "import { Login } from '../pages/Login';\nimport { ChangePasswordModal } from './ChangePasswordModal';"
);

content = content.replace(
  "export function Layout({ children }: { children: ReactNode }) {",
  "export function Layout({ children }: { children: ReactNode }) {"
);

content = content.replace(
  "const { isAuthenticated } = useStore();",
  "const { isAuthenticated, currentUser } = useStore();"
);

content = content.replace(
  "    </div>\n  );\n}",
  "      {currentUser?.mustChangePassword && <ChangePasswordModal />}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
