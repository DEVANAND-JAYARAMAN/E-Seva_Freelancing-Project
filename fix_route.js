const fs = require('fs');
let code = fs.readFileSync('frontend/src/screens/services/ServicesPage.tsx', 'utf8');

const target = `    if (service.id === "tnega") {
      router.push(PATHS.TNEGA);
      return;
    }
    setSelectedService(service);
    setFormData({});
    setErrors({});
    setSelectedFiles([]);
    setPaymentPhase("form");
    setIsModalOpen(true);`;

const replacement = `    if (service.id === "tnega") {
      router.push(PATHS.TNEGA);
      return;
    }
    router.push(\`/services/\${service.id}\`);`;

code = code.replace(target, replacement);
fs.writeFileSync('frontend/src/screens/services/ServicesPage.tsx', code);
console.log("ServicesPage modified");
