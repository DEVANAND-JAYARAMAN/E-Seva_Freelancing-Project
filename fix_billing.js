const fs = require('fs');

let code = fs.readFileSync('frontend/src/screens/billing/BillingPage.tsx', 'utf8');

// Replace the handleOfficialCostChange and the input with just a fetched value.
const stateReplacement = `
  // New state to hold dynamic services mapping and pricing matrix
  const [pricingMatrix, setPricingMatrix] = useState<any>({});
  
  useEffect(() => {
    fetchRequests();
    
    // Load saved pricing matrix
    const savedPrices = localStorage.getItem("thuruvan_service_pricing_matrix_v2");
    if (savedPrices) {
      try {
        const matrix = JSON.parse(savedPrices);
        // Flatten the matrix into a simple mapping of { "service-id": adminPrice }
        const flatPrices: Record<string, number> = {};
        Object.keys(matrix).forEach(key => {
          matrix[key].forEach((sub: any) => {
            flatPrices[sub.id] = sub.adminPrice || 0;
            // Also map by exact name in case ID doesn't match
            flatPrices[sub.name] = sub.adminPrice || 0;
            flatPrices[sub.name.toLowerCase()] = sub.adminPrice || 0;
          });
        });
        setPricingMatrix(flatPrices);
      } catch (e) {
        console.error("Failed to parse pricing matrix", e);
      }
    }
  }, []);

  // Compute official cost by checking matrix
  const getOfficialCost = (req: any) => {
    // Attempt to match by serviceName or serviceName derived ID
    const nameMatch = pricingMatrix[req.serviceName] || pricingMatrix[req.serviceName.toLowerCase()];
    if (nameMatch !== undefined) return nameMatch;
    
    // Fallback: 0 if not found
    return 0;
  };
`;

code = code.replace(/const \[officialCosts, setOfficialCosts\][^;]+;\n/g, "");
code = code.replace(/const handleOfficialCostChange = [\s\S]*?localStorage\.setItem\([^)]+\);\n  };\n/g, "");

// Modify the map to use getOfficialCost instead of officialCosts[req.id]
code = code.replace(/const totalOfficialCost = useMemo\(\(\) => \{\n    return filteredRequests.reduce\(\(sum, r\) => sum \+ \(officialCosts\[r\.id\] \|\| 0\), 0\);\n  \}, \[filteredRequests, officialCosts\]\);/, 
`const totalOfficialCost = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + getOfficialCost(r), 0);
  }, [filteredRequests, pricingMatrix]);`);

code = code.replace(/const officialCost = officialCosts\[req.id\] \|\| 0;/, `const officialCost = getOfficialCost(req);`);
code = code.replace(/const offCost = officialCosts\[req\.id\] \|\| 0;/g, `const offCost = getOfficialCost(req);`);

code = code.replace(/<div className="flex items-center justify-center">\s*<span className="text-slate-400 mr-2 font-bold">₹<\/span>\s*<input[\s\S]*?className="w-24 px-3 py-1.5 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-\[#0a0f18\] text-slate-800 dark:text-white focus:outline-none focus:border-\[#005c3a\] dark:focus:border-emerald-500 shadow-sm"\s*\/>\s*<\/div>/, `<div className="text-center font-bold text-slate-600 dark:text-slate-300">
                            ₹{getOfficialCost(req).toLocaleString()}
                          </div>`);

// Inject stateReplacement just before useEffect
code = code.replace(/useEffect\(\(\) => \{\n    fetchRequests\(\);\n    \/\/ Load saved official costs from local storage[\s\S]*?\}, \[\]\);/, stateReplacement);

fs.writeFileSync('frontend/src/screens/billing/BillingPage.tsx', code);
console.log("Updated BillingPage.tsx");
