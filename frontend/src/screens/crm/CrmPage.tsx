"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Plus,
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export interface Customer {
  id: string;
  name: string;
  shopName: string;
  email: string;
  phone: string;
  city: string;
  type: "Retailer" | "Distributor" | "Individual";
  status: "Active" | "Inactive";
  joinedDate: string;
}

const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Devanand Jayaraman",
    shopName: "Jayaraman Digital Agencies",
    email: "agency@jayaraman.in",
    phone: "9876543222",
    city: "Chennai",
    type: "Distributor",
    status: "Active",
    joinedDate: "2026-04-01",
  },
  {
    id: "cust-2",
    name: "Sahin Alam",
    shopName: "Thuruvan Telecom Systems",
    email: "sahin@telecom.in",
    phone: "8765432333",
    city: "Kolkata",
    type: "Distributor",
    status: "Active",
    joinedDate: "2026-04-10",
  },
  {
    id: "cust-3",
    name: "Rajesh Kumar",
    shopName: "South India Digital Network",
    email: "rajesh@sidn.co.in",
    phone: "7654324444",
    city: "Bangalore",
    type: "Distributor",
    status: "Inactive",
    joinedDate: "2026-05-01",
  },
  {
    id: "cust-4",
    name: "Priya Sharma",
    shopName: "Priya Online E-Seva",
    email: "priya@onlineeseva.com",
    phone: "9918273645",
    city: "Delhi",
    type: "Retailer",
    status: "Active",
    joinedDate: "2026-05-15",
  },
  {
    id: "cust-5",
    name: "Karthik Raja",
    shopName: "KR Multi Services",
    email: "karthik@krmulti.in",
    phone: "9123456789",
    city: "Madurai",
    type: "Retailer",
    status: "Active",
    joinedDate: "2026-05-20",
  },
];

export function CrmPage() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>(
    "thuruvan_crm_customers",
    initialCustomers,
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<Customer["type"]>("Retailer");
  const [status, setStatus] = useState<Customer["status"]>("Active");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.shopName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesType = typeFilter === "All" || c.type === typeFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shopName || !email || !phone) return;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      shopName,
      email,
      phone,
      city: city || "Unknown",
      type,
      status,
      joinedDate: new Date().toISOString().split("T")[0],
    };

    setCustomers([newCustomer, ...customers]);
    setIsFormOpen(false);
    // Reset Form
    setName("");
    setShopName("");
    setEmail("");
    setPhone("");
    setCity("");
    setType("Retailer");
    setStatus("Active");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("CRM Customers List", 14, 20);

    const tableColumn = [
      "Name",
      "Shop Name",
      "Email",
      "Phone",
      "City",
      "Type",
      "Status",
    ];
    const tableRows = filteredCustomers.map((c) => [
      c.name,
      c.shopName,
      c.email,
      c.phone,
      c.city,
      c.type,
      c.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("crm_customers.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "crm_customers.xlsx");
  };

  const activeCount = customers.filter((c) => c.status === "Active").length;
  const totalCount = customers.length;
  const retailerCount = customers.filter((c) => c.type === "Retailer").length;
  const distributorCount = customers.filter(
    (c) => c.type === "Distributor",
  ).length;

  return (
    <AppShell activePage="CRM">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Customer Relationship Hub
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Track leads, manage system users, oversee distributors and
              retailers interactions, and build long-lasting business relations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToPDF}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 font-bold text-sm transition-all"
            >
              <FileText size={16} /> PDF
            </button>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/50 font-bold text-sm transition-all"
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] text-white font-extrabold text-sm shadow-sm transition-all"
            >
              <Plus size={16} /> Add Client
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {totalCount}
              </span>
              <span className="text-xs font-bold text-emerald-500">
                +100% all-time
              </span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {activeCount}
              </span>
              <span className="text-xs font-bold text-emerald-500">
                {((activeCount / (totalCount || 1)) * 100).toFixed(0)}%
                engagement
              </span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Retailers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {retailerCount}
              </span>
              <span className="text-xs font-bold text-blue-500">
                Retailer network
              </span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Distributors
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {distributorCount}
              </span>
              <span className="text-xs font-bold text-purple-500">
                Channel Partners
              </span>
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="flex flex-col gap-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, shop name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#005c3a]/50 dark:focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Distributor">Distributor</option>
                <option value="Retailer">Retailer</option>
                <option value="Individual">Individual</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4">Client Detail</th>
                  <th className="py-4 px-4">Contact Info</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-800 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-xs font-semibold text-[#005c3a] dark:text-emerald-400">
                          {customer.shopName}
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Mail size={12} />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Phone size={12} />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin size={12} />
                          <span>{customer.city}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            customer.type === "Distributor"
                              ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                              : customer.type === "Retailer"
                                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {customer.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">
                        {customer.joinedDate}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            customer.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {customer.status === "Active" ? (
                            <CheckCircle size={10} />
                          ) : (
                            <AlertCircle size={10} />
                          )}
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400 dark:text-slate-600 font-semibold"
                    >
                      No matching customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Add New Client / Customer
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Account Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as Customer["type"])
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="Retailer">Retailer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as Customer["status"])
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white text-sm font-extrabold"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
