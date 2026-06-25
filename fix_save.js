const fs = require('fs');

let code = fs.readFileSync('frontend/src/screens/services/ServicesPage.tsx', 'utf8');

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
    
    // Update local state immediately for fast feedback
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
    
    // Push update to backend
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
      console.error("Failed to update service in backend", e);
    }
    
    setEditModalOpen(false);
    setEditingService(null);
  };`;

code = code.replace(targetSave, replSave);

fs.writeFileSync('frontend/src/screens/services/ServicesPage.tsx', code);
console.log("Updated handleSaveService in ServicesPage.tsx");
