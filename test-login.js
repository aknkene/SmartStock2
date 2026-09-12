const mockUsers = [
  { id: 'u1', username: 'admin', password: '12345', name: 'Admin', role: 'ADMIN' },
];
const users = mockUsers;
const username = 'admin';
const password = '12345';
const cleanUser = username.trim().toLowerCase();
const user = users.find(u => 
    (u.username.toLowerCase() === cleanUser || (cleanUser === 'staff' && u.username.toLowerCase() === 'staff01')) && 
    u.password === password
);
console.log(user);
