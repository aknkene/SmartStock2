const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// I also need to ensure that the code is catching permission errors correctly or not failing silently.
// But mostly, the writeToDb uses async/await without catch, which means unhandled promises if they fail.
content = content.replace(
  /await setDoc\(doc\(db, collectionName, id\), data, \{ merge: true \}\);/g,
  `try { await setDoc(doc(db, collectionName, id), data, { merge: true }); } catch (e) { console.error("Firebase write error:", e); }`
);

content = content.replace(
  /await deleteDoc\(doc\(db, collectionName, id\)\);/g,
  `try { await deleteDoc(doc(db, collectionName, id)); } catch (e) { console.error("Firebase delete error:", e); }`
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
