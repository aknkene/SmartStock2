const fs = require('fs');

let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

content = content.replace(/{\/\* Environment Mode Toggle \*\/}[\s\S]*?{\/\* Language Toggle \*\/}/, '{/* Language Toggle */}');

fs.writeFileSync('src/components/Header.tsx', content, 'utf8');
