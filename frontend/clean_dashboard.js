const fs = require('fs');
let code = fs.readFileSync('src/screens/dashboard/DashboardPage2.tsx', 'utf8');

code = code.replace(/\/\/ State for wallet request popup[\s\S]*?setRequestUtr\(""\);\n  \};\n/g, '');

fs.writeFileSync('src/screens/dashboard/DashboardPage2.tsx', code);
console.log('Cleaned up dead variables');
