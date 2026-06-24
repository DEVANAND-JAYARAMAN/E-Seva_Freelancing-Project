const fs = require('fs');
let code = fs.readFileSync('src/screens/WalletPage.tsx', 'utf8');

code = code.replace(/t\.description\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)/g, '(t.description || "").toLowerCase().includes((searchTerm || "").toLowerCase())');
code = code.replace(/t\.reference\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)/g, '(t.reference || "").toLowerCase().includes((searchTerm || "").toLowerCase())');
code = code.replace(/req\.utrNumber\.toLowerCase\(\) === utrNumber\.trim\(\)\.toLowerCase\(\)/g, '(req.utrNumber || "").toLowerCase() === (utrNumber || "").trim().toLowerCase()');
code = code.replace(/t\.reference\.toLowerCase\(\) === utrNumber\.trim\(\)\.toLowerCase\(\)/g, '(t.reference || "").toLowerCase() === (utrNumber || "").trim().toLowerCase()');

fs.writeFileSync('src/screens/WalletPage.tsx', code);
console.log('Fixed undefined properties in WalletPage');
