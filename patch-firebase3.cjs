const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

content = content.replace(
  /unsubs\.push\(onSnapshot\(collection\(db, 'users'\), \(snapshot\) => \{\s*setProdUsers\(snapshot\.docs\.map\(doc => \(\{ \.\.\.doc\.data\(\), id: doc\.id \} as User\)\)\);\s*\}\)\);/,
  `unsubs.push(onSnapshot(collection(db, 'users'), (snapshot) => {
        if (snapshot.docs.length === 0) {
          const adminUser = mockUsers.find(u => u.username === "admin") || mockUsers[0];
          setDoc(doc(db, 'users', adminUser.id), adminUser);
        } else {
          setProdUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
        }
      }));`
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
