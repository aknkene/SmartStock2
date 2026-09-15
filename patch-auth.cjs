const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetState = `  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);`;

const newState = `  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_inventory_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [originalUser, setOriginalUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_inventory_original_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('school_inventory_user');
  });`;

content = content.replace(targetState, newState);

const targetLogin = `    if (user) {
      setCurrentUser(user);
      setOriginalUser(user);
      setIsAuthenticated(true);
      logAction('LOGIN', \`เข้าสู่ระบบสำเร็จ: \${user.name} (\${user.username})\`);`;

const newLogin = `    if (user) {
      setCurrentUser(user);
      setOriginalUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('school_inventory_user', JSON.stringify(user));
      localStorage.setItem('school_inventory_original_user', JSON.stringify(user));
      logAction('LOGIN', \`เข้าสู่ระบบสำเร็จ: \${user.name} (\${user.username})\`);`;

content = content.replace(targetLogin, newLogin);

const targetLogout = `  const logout = () => {
    setCurrentUser(null);
    setOriginalUser(null);
    setIsAuthenticated(false);
  };`;

const newLogout = `  const logout = () => {
    setCurrentUser(null);
    setOriginalUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('school_inventory_user');
    localStorage.removeItem('school_inventory_original_user');
  };`;

content = content.replace(targetLogout, newLogout);

// Also handle switchUser:
const targetSwitch = `    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      logAction('SWITCH_ROLE', \`สลับมุมมองผู้ใช้เป็น: \${target.name} [บทบาท: \${target.role}]\`);`;

const newSwitch = `    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      localStorage.setItem('school_inventory_user', JSON.stringify(target));
      logAction('SWITCH_ROLE', \`สลับมุมมองผู้ใช้เป็น: \${target.name} [บทบาท: \${target.role}]\`);`;

content = content.replace(targetSwitch, newSwitch);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
