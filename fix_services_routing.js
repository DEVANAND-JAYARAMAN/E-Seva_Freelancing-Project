const fs = require('fs');

let code = fs.readFileSync('frontend/src/screens/services/ServicesPage.tsx', 'utf8');

// Update routing
const targetRouting = `    if (service.id === "tnega") {
      router.push(PATHS.TNEGA);
      return;
    }
    setSelectedService(service);
    setFormData({});
    setErrors({});
    setSelectedFiles([]);
    setPaymentPhase("form");
    setIsModalOpen(true);
  };`;

const replRouting = `    if (service.id === "tnega") {
      router.push(PATHS.TNEGA);
      return;
    }
    
    // Check if it's a dynamic service (not in predefined PATHS)
    const predefinedServices = ["msme", "utisl-pan", "employment-services", "fssai", "voter-id", "registration-dept", "rto-services", "can-edit", "aadhaar-card-address", "software-keys", "ration-card", "gst", "police-verification", "certificate-courses", "agri-stack-pdf", "pvc-card-print", "cm-health-card", "dharsan", "tnega"];
    
    if (!predefinedServices.includes(service.id)) {
      // Dynamic service routing
      router.push(\`/services/dynamic_service?id=\${service.id}\`);
      return;
    }
    
    setSelectedService(service);
    setFormData({});
    setErrors({});
    setSelectedFiles([]);
    setPaymentPhase("form");
    setIsModalOpen(true);
  };`;

if (code.includes('router.push(PATHS.TNEGA);')) {
    code = code.replace(targetRouting, replRouting);
}

// Update handleSaveService
const targetSave = `  const handleSaveService = (
    updatedName: string,
    customImage: string | null,
  ) => {
    if (!editingService) return;
    setServicesList((prev) =>
      prev.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: updatedName,
              customImage: customImage || s.customImage,
            }
          : s,
      ),
    );
    setEditModalOpen(false);
    setEditingService(null);
  };`;

const replSave = `  const handleSaveService = async (
    updatedName: string,
    customImage: string | null,
  ) => {
    if (!editingService) return;
    
    setServicesList((prev) =>
      prev.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: updatedName,
              customImage: customImage || s.customImage,
            }
          : s,
      ),
    );
    
    try {
      const updatedService = {
        ...editingService,
        name: updatedName,
        customImage: customImage || editingService.customImage,
      };
      
      await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic/\${editingService.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedService,
          retailerCharge: typeof updatedService.price?.retailer === 'number' ? updatedService.price.retailer : 0,
          distributorCharge: typeof updatedService.price?.distributor === 'number' ? updatedService.price.distributor : 0,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    
    setEditModalOpen(false);
    setEditingService(null);
  };`;

if (code.includes('const handleSaveService = (')) {
    code = code.replace(targetSave, replSave);
}

fs.writeFileSync('frontend/src/screens/services/ServicesPage.tsx', code);
console.log("Updated ServicesPage.tsx routing and save");
