const fs = require('fs');
let code = fs.readFileSync('src/screens/WalletPage.tsx', 'utf8');

code = code.replace(/process\.env\.NEXT_PUBLIC_MERCHANT_UPI \|\| "merchant@upi"/g, '"mkksriptsami@oksbi"');
code = code.replace(/process\.env\.NEXT_PUBLIC_MERCHANT_NAME \|\| "Merchant"/g, '"Thuruvan Communications"');

fs.writeFileSync('src/screens/WalletPage.tsx', code);
console.log('Fixed QR generator');
