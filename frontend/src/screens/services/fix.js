const fs = require('fs');
let code = fs.readFileSync('ServicesPage.tsx', 'utf8');

code = code.replace(/\{[\s\S]*?id:\s*['\"].*?['\"][\s\S]*?formFields:[\s\S]*?\}/g, (match) => {
    if (match.includes('price:')) {
        return match.replace(/price:\s*\{\s*retailer:\s*0,\s*distributor:\s*0\s*\}/, 'price: { retailer: 150, distributor: 150 }');
    } else {
        return match.replace(/\}(\s*)$/, '  price: { retailer: 150, distributor: 150 }\n      }');
    }
});
fs.writeFileSync('ServicesPage.tsx', code);
console.log('Fixed prices in ServicesPage.tsx');
