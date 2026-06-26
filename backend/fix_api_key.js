const fs = require('fs');
let code = fs.readFileSync('backend/service/service_handlers.go', 'utf8');
code = code.replace('apiKey := "5f89c01e1d5be436659591de5c7d93d1bcd97c7091448f9e"', 'apiKey := "de84d65d816961eef8662345e4147587c38f2963ca480dbd"');
fs.writeFileSync('backend/service/service_handlers.go', code);
console.log('API key replaced');
