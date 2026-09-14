const fs = require('fs');

let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

content = content.replace(
  'const [prodUsers, setProdUsers] = useState<User[]>(mockUsers);',
  'const [prodUsers, setProdUsers] = useState<User[]>([mockUsers.find(u => u.username === "admin") || mockUsers[0]]);'
);

content = content.replace(
  'const [prodStudents, setProdStudents] = useState<Student[]>(mockStudents);',
  'const [prodStudents, setProdStudents] = useState<Student[]>([]);'
);

content = content.replace(
  'const [prodProducts, setProdProducts] = useState<Product[]>(mockProducts);',
  'const [prodProducts, setProdProducts] = useState<Product[]>([]);'
);

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
