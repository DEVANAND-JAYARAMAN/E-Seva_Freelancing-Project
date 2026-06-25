const fs = require('fs');

let code = fs.readFileSync('frontend/src/screens/billing/BillingPage.tsx', 'utf8');

// Replace state and fetch logic
const target1 = `  const [officialCosts, setOfficialCosts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "year">("day");

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\\/api|\\/)+$/, "");

  const fetchRequests = async () => {
    try {
      const res = await fetch(\`\${baseUrl}/api/services/requests\`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((app: any) => ({
          id: app.id || app.Id,
          serviceName: app.serviceName || app.ServiceName || "Unknown Service",
          cost: parseFloat(app.cost || app.Cost || "0"),
          status: app.status || app.Status || "Pending",
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
        }));
        setRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Load saved official costs from local storage
    const saved = localStorage.getItem("eseva_official_costs");
    if (saved) {
      try {
        setOfficialCosts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleOfficialCostChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newCosts = { ...officialCosts, [id]: numericValue };
    setOfficialCosts(newCosts);
    localStorage.setItem("eseva_official_costs", JSON.stringify(newCosts));
  };`;

const repl1 = `  const [pricingMatrix, setPricingMatrix] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "year">("day");

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\\/api|\\/)+$/, "");

  const fetchRequests = async () => {
    try {
      const res = await fetch(\`\${baseUrl}/api/services/requests\`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((app: any) => ({
          id: app.id || app.Id,
          serviceName: app.serviceName || app.ServiceName || "Unknown Service",
          cost: parseFloat(app.cost || app.Cost || "0"),
          status: app.status || app.Status || "Pending",
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
        }));
        setRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Load saved pricing matrix
    const savedPrices = localStorage.getItem("thuruvan_service_pricing_matrix_v2");
    if (savedPrices) {
      try {
        const matrix = JSON.parse(savedPrices);
        const flatPrices: Record<string, number> = {};
        Object.keys(matrix).forEach((key) => {
          matrix[key].forEach((sub: any) => {
            flatPrices[sub.id] = sub.adminPrice || 0;
            flatPrices[sub.name] = sub.adminPrice || 0;
            if (sub.name) flatPrices[sub.name.toLowerCase()] = sub.adminPrice || 0;
          });
        });
        setPricingMatrix(flatPrices);
      } catch (e) {
        console.error("Failed to parse pricing matrix", e);
      }
    }
  }, []);

  const getOfficialCost = (req: any) => {
    const nameMatch = pricingMatrix[req.serviceName] || (req.serviceName ? pricingMatrix[req.serviceName.toLowerCase()] : undefined);
    if (nameMatch !== undefined) return nameMatch;
    return 0;
  };`;

code = code.replace(target1, repl1);

const target2 = `  const totalOfficialCost = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + (officialCosts[r.id] || 0), 0);
  }, [filteredRequests, officialCosts]);`;

const repl2 = `  const totalOfficialCost = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + getOfficialCost(r), 0);
  }, [filteredRequests, pricingMatrix]);`;

code = code.replace(target2, repl2);

const target3 = `      const officialCost = officialCosts[req.id] || 0;`;
const repl3 = `      const officialCost = getOfficialCost(req);`;
code = code.replace(target3, repl3);

const target4 = `      .map((key) => ({
        date: key,
        "Service Charge": groupedByTime[key].serviceCharge,
        "Official Cost": groupedByTime[key].officialCost,
        "Net Profit": groupedByTime[key].profit,
      }));
  }, [filteredRequests, officialCosts, timeFilter]);`;
const repl4 = `      .map((key) => ({
        date: key,
        "Service Charge": groupedByTime[key].serviceCharge,
        "Official Cost": groupedByTime[key].officialCost,
        "Net Profit": groupedByTime[key].profit,
      }));
  }, [filteredRequests, pricingMatrix, timeFilter]);`;
code = code.replace(target4, repl4);

const target5 = `                    const offCost = officialCosts[req.id] || 0;`;
const repl5 = `                    const offCost = getOfficialCost(req);`;
code = code.replace(target5, repl5);

const target6 = `                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <span className="text-slate-400 mr-2 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={officialCosts[req.id] || ""}
                              onChange={(e) => handleOfficialCostChange(req.id, e.target.value)}
                              placeholder="0"
                              className="w-24 px-3 py-1.5 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0f18] text-slate-800 dark:text-white focus:outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 shadow-sm"
                            />
                          </div>
                        </td>`;
const repl6 = `                        <td className="py-4 px-4">
                          <div className="text-center font-bold text-slate-600 dark:text-slate-300">
                            ₹{getOfficialCost(req).toLocaleString()}
                          </div>
                        </td>`;
code = code.replace(target6, repl6);

fs.writeFileSync('frontend/src/screens/billing/BillingPage.tsx', code);
console.log("Updated correctly");
