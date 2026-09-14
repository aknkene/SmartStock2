const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

content = content.replace(
  /setUsersState\(prev => prev\.map\(u => \{\s*if \(u\.id === userId\) \{\s*const updated = \{ \.\.\.u \};\s*\(Object\.keys\(data\) as \(keyof User\)\[\]\)\.forEach\(key => \{\s*if \(data\[key\] !== undefined && data\[key\] !== ''\) \{\s*\(updated as any\)\[key\] = data\[key\];\s*\} else if \(data\[key\] !== undefined && key !== 'password'\) \{\s*\(updated as any\)\[key\] = data\[key\];\s*\}\s*\}\);\s*return updated;\s*\}\s*return u;\s*\}\)\);/,
  `if (mode === 'PRODUCTION') {
      const updateData = { ...data };
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof User] === undefined) delete updateData[key as keyof User];
      });
      writeToDb('users', userId, updateData);
    } else {
      setDemoUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u };
          (Object.keys(data) as (keyof User)[]).forEach(key => {
            if (data[key] !== undefined && data[key] !== '') {
              (updated as any)[key] = data[key];
            } else if (data[key] !== undefined && key !== 'password') {
              (updated as any)[key] = data[key];
            }
          });
          return updated;
        }
        return u;
      }));
    }`
);

content = content.replace(
  /setUsersState\(prev => prev\.map\(u => u\.id === userId \? \{ \.\.\.u, password: newPassword, forcePasswordChange: forceChange \} : u\)\);/,
  `if (mode === 'PRODUCTION') {
      writeToDb('users', userId, { password: newPassword, forcePasswordChange: forceChange });
    } else {
      setDemoUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, forcePasswordChange: forceChange } : u));
    }`
);

content = content.replace(
  /if \(newSem\.isActive\) \{\s*setSemesters\(prev => \[newSem, \.\.\.prev\.map\(s => \(\{ \.\.\.s, isActive: false \}\)\)\]\);\s*\} else \{\s*setSemesters\(prev => \[newSem, \.\.\.prev\]\);\s*\}/,
  `if (mode === 'PRODUCTION') {
      if (newSem.isActive) {
        semesters.forEach(s => {
          if (s.isActive) writeToDb('semesters', s.id, { isActive: false });
        });
      }
      writeToDb('semesters', newSem.id, newSem);
    } else {
      if (newSem.isActive) {
        setSemesters(prev => [newSem, ...prev.map(s => ({ ...s, isActive: false }))]);
      } else {
        setSemesters(prev => [newSem, ...prev]);
      }
    }`
);

content = content.replace(
  /setSemesters\(prev => prev\.map\(s => \{\s*if \(s\.id === id\) \{\s*return \{ \.\.\.s, \.\.\.data \};\s*\}\s*if \(data\.isActive\) \{\s*return \{ \.\.\.s, isActive: false \};\s*\}\s*return s;\s*\}\)\);/,
  `if (mode === 'PRODUCTION') {
      if (data.isActive) {
        semesters.forEach(s => {
          if (s.isActive && s.id !== id) writeToDb('semesters', s.id, { isActive: false });
        });
      }
      writeToDb('semesters', id, data);
    } else {
      setSemesters(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, ...data };
        }
        if (data.isActive) {
          return { ...s, isActive: false };
        }
        return s;
      }));
    }`
);

content = content.replace(
  /setSemesters\(prev => prev\.filter\(s => s\.id !== id\)\);/,
  `if (mode === 'PRODUCTION') { deleteFromDb('semesters', id); } else { setSemesters(prev => prev.filter(s => s.id !== id)); }`
);

content = content.replace(
  /setSemesters\(prev => prev\.map\(s => \(\{\s*\.\.\.s,\s*isActive: s\.id === id,\s*status: s\.id === id \? 'ACTIVE' : s\.status === 'ACTIVE' \? 'CLOSED' : s\.status,\s*\}\)\)\);/,
  `if (mode === 'PRODUCTION') {
      semesters.forEach(s => {
        if (s.id === id) {
          writeToDb('semesters', s.id, { isActive: true, status: 'ACTIVE' });
        } else if (s.isActive || s.status === 'ACTIVE') {
          writeToDb('semesters', s.id, { isActive: false, status: 'CLOSED' });
        }
      });
    } else {
      setSemesters(prev => prev.map(s => ({
        ...s,
        isActive: s.id === id,
        status: s.id === id ? 'ACTIVE' : s.status === 'ACTIVE' ? 'CLOSED' : s.status,
      })));
    }`
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
