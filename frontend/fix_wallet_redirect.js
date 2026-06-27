const fs = require('fs');

let code = fs.readFileSync('frontend/src/screens/WalletPage.tsx', 'utf8');

const targetStr = `redirect_url: window.location.origin + window.location.pathname,`;
const replStr = `redirect_url: baseUrl + "/api/v1/wallet/recharge/return?redirect_url=" + encodeURIComponent(window.location.origin + window.location.pathname),`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replStr);
    fs.writeFileSync('frontend/src/screens/WalletPage.tsx', code);
    console.log('Replaced redirect_url successfully');
} else {
    console.log('Could not find redirect_url');
}
