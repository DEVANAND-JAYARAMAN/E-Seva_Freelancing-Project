const fs = require('fs');
let code = fs.readFileSync('src/screens/WalletPage.tsx', 'utf8');

code = code.replace(/const matchesType = typeFilter === "all" \? true : t\.type === typeFilter;/g, 'const matchesType = typeFilter === "all" ? true : (t.type || "").toLowerCase() === typeFilter.toLowerCase();');

fs.writeFileSync('src/screens/WalletPage.tsx', code);
console.log('Fixed type filter sensitivity');
