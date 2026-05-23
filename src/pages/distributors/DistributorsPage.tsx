"use client";

import { useState } from "react";
import { Plus, Building2, Sparkles } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { DistributorStats } from "./DistributorStats";
import { DistributorTable } from "./DistributorTable";
import { DistributorForm } from "./DistributorForm";
import type { Distributor } from "./types";

// Premium Initial Seed Mockup Data for Distributors
const initialDistributorsList: Distributor[] = [
  {
    id: "dist-1",
    name: "Devanand Jayaraman",
    shopName: "Jayaraman Digital Agencies",
    email: "agency@jayaraman.in",
    phone: "9876543222",
    city: "Chennai",
    balance: 85200.0,
    status: "Active",
    createdDate: "2026-04-01",
    aadhaarNo: "4532 9012 3456",
  },
  {
    id: "dist-2",
    name: "Sahin Alam",
    shopName: "Thuruvan Telecom Systems",
    email: "sahin@telecom.in",
    phone: "8765432333",
    city: "Kolkata",
    balance: 145000.0,
    status: "Active",
    createdDate: "2026-04-10",
    aadhaarNo: "8912 0184 7291",
  },
  {
    id: "dist-3",
    name: "Rajesh Kumar",
    shopName: "South India Digital Network",
    email: "rajesh@sidn.co.in",
    phone: "7654324444",
    city: "Bangalore",
    balance: 0.0,
    status: "Suspended",
    createdDate: "2026-05-01",
    aadhaarNo: "5612 3456 7890",
  },
];

export function DistributorsPage() {
  const [distributors, setDistributors] = useLocalStorage<Distributor[]>(
    "thuruvan_distributors_list",
    initialDistributorsList,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] =
    useState<Distributor | null>(null);

  // Add / Edit submission handler
  const handleFormSubmit = (
    data: Omit<Distributor, "id" | "createdDate"> & { id?: string },
  ) => {
    if (data.id) {
      // Edit mode
      setDistributors((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                name: data.name,
                shopName: data.shopName,
                email: data.email,
                phone: data.phone,
                city: data.city,
                balance: data.balance,
                status: data.status,
                aadhaarNo: data.aadhaarNo,
              }
            : item,
        ),
      );
    } else {
      // Add mode
      const newDistributor: Distributor = {
        id: `dist-${Date.now()}`,
        name: data.name,
        shopName: data.shopName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        balance: data.balance,
        status: data.status,
        createdDate: new Date().toISOString().split("T")[0],
        aadhaarNo: data.aadhaarNo,
      };
      setDistributors((prev) => [newDistributor, ...prev]);
    }
  };

  // Toggle status quick-action handler
  const handleToggleStatus = (id: string) => {
    setDistributors((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Active" ? "Suspended" : "Active",
            }
          : item,
      ),
    );
  };

  // Trigger form for Edit
  const handleEditClick = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setIsFormOpen(true);
  };

  // Trigger form for Add
  const handleAddClick = () => {
    setSelectedDistributor(null);
    setIsFormOpen(true);
  };

  return (
    <AppShell activePage="Distributors">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400">
                <Building2 size={12} />
              </span>
              <span className="text-[10px] font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                Channel Partners{" "}
                <Sparkles size={10} className="animate-pulse" />
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Distributors Hub
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Register regional channel distributors, manage master wallets,
              status-guard accounts, and audit floating credit limits for
              high-volume transactions.
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Distributor</span>
          </button>
        </div>

        {/* Stats Grid */}
        <DistributorStats distributors={distributors} />

        {/* List Table */}
        <DistributorTable
          distributors={distributors}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleStatus}
        />

        {/* Add/Edit Form Modal */}
        <DistributorForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          distributor={selectedDistributor}
        />
      </section>
    </AppShell>
  );
}
