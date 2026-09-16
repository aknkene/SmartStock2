const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, runTransaction } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';"
);

// Update useState initializations
const targetUserInit = `  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_inventory_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });`;

const newUserInit = `  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    localStorage.removeItem('school_inventory_user');
    const saved = sessionStorage.getItem('school_inventory_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });`;
content = content.replace(targetUserInit, newUserInit);

const targetOriginalInit = `  const [originalUser, setOriginalUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_inventory_original_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });`;

const newOriginalInit = `  const [originalUser, setOriginalUser] = useState<User | null>(() => {
    localStorage.removeItem('school_inventory_original_user');
    const saved = sessionStorage.getItem('school_inventory_original_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });`;
content = content.replace(targetOriginalInit, newOriginalInit);

const targetAuthInit = `  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('school_inventory_user');
  });`;

const newAuthInit = `  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('school_inventory_user');
  });`;
content = content.replace(targetAuthInit, newAuthInit);

// Update login function
const targetLogin = `    if (user) {
      setCurrentUser(user);
      setOriginalUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('school_inventory_user', JSON.stringify(user));
      localStorage.setItem('school_inventory_original_user', JSON.stringify(user));
      logAction('LOGIN', \`เข้าสู่ระบบสำเร็จ: \${user.name} (\${user.username})\`);
      return true;
    }`;

const newLogin = `    if (user) {
      setCurrentUser(user);
      setOriginalUser(user);
      setIsAuthenticated(true);
      sessionStorage.setItem('school_inventory_user', JSON.stringify(user));
      sessionStorage.setItem('school_inventory_original_user', JSON.stringify(user));
      if (mode === 'PRODUCTION') {
        updateDoc(doc(db, 'users', user.id), { lastLoginAt: serverTimestamp() }).catch(e => console.error("Error updating last login", e));
      }
      logAction('LOGIN', \`เข้าสู่ระบบสำเร็จ: \${user.name} (\${user.username})\`);
      return true;
    }`;
content = content.replace(targetLogin, newLogin);

// Update switchUser function
const targetSwitch = `    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      localStorage.setItem('school_inventory_user', JSON.stringify(target));
      logAction('SWITCH_ROLE', \`สลับมุมมองผู้ใช้เป็น: \${target.name} [บทบาท: \${target.role}]\`);
      return target;
    }`;

const newSwitch = `    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      sessionStorage.setItem('school_inventory_user', JSON.stringify(target));
      logAction('SWITCH_ROLE', \`สลับมุมมองผู้ใช้เป็น: \${target.name} [บทบาท: \${target.role}]\`);
      return target;
    }`;
content = content.replace(targetSwitch, newSwitch);

// Update logout function
const targetLogout = `  const logout = () => {
    setCurrentUser(null);
    setOriginalUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('school_inventory_user');
    localStorage.removeItem('school_inventory_original_user');
  };`;

const newLogout = `  const logout = () => {
    setCurrentUser(null);
    setOriginalUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('school_inventory_user');
    sessionStorage.removeItem('school_inventory_original_user');
    localStorage.removeItem('school_inventory_user'); // Safety cleanup
    localStorage.removeItem('school_inventory_original_user'); // Safety cleanup
  };`;
content = content.replace(targetLogout, newLogout);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
