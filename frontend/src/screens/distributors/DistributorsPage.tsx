"use client";

import { useState, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { DistributorStats } from "./DistributorStats";
import { DistributorTable } from "./DistributorTable";
import { DistributorForm } from "./DistributorForm";
import type { Distributor } from "./types";

// Premium Initial Seed Mockup Data for Distributors
const initialDistributorsList: Distributor[] = [];

export function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  // Fetch real data from backend
  const fetchDistributors = async () => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/distributors`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((user: any) => ({
          id: user.UserId || user.userId,
          name: user.FullName || user.name || "Unknown",
          shopName: "E-Seva Center", // Backend doesn't store this yet
          email: user.Email || user.email,
          phone: user.Mobile || user.mobile,
          city: "Tamil Nadu", // Default
          balance: user.WalletBalance || user.walletBalance || 0,
          status: user.Status || user.status || "Active",
          createdDate: (user.CreatedAt || user.createdAt || "").split("T")[0],
        }));
        setDistributors(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch distributors:", e);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  // Add / Edit submission handler
  const handleFormSubmit = (
    data: Omit<Distributor, "id" | "createdDate"> & { id?: string },
  ) => {
    if (data.id) {
      // Edit mode
      setDistributors((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? { ...item, ...data }
            : item,
        ),
      );
    } else {
      // Add mode
      const newDistributor: Distributor = {
        ...data,
        id: `dist-${Date.now()}`,
        createdDate: new Date().toISOString().split("T")[0],
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
