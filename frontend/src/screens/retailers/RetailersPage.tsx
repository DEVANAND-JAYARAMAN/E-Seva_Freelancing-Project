"use client";

import { useState, useEffect } from "react";
import { Plus, Store } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { RetailerStats } from "./RetailerStats";
import { RetailerTable } from "./RetailerTable";
import { RetailerForm } from "./RetailerForm";
import type { Retailer } from "./types";

// Premium Initial Seed Mockup Data
const initialRetailersList: Retailer[] = [];

export function RetailersPage() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  // Fetch real data from backend
  const fetchRetailers = async () => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/retailers`);
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
        setRetailers(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch retailers:", e);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  // Add / Edit submission handler (Local state for now, backend save not fully implemented for editing)
  const handleFormSubmit = (
    data: Omit<Retailer, "id" | "createdDate"> & { id?: string },
  ) => {
    if (data.id) {
      // Edit mode (Mocked)
      setRetailers((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? { ...item, ...data }
            : item,
        ),
      );
    } else {
      // Add mode (Mocked)
      const newRetailer: Retailer = {
        ...data,
        id: `ret-${Date.now()}`,
        createdDate: new Date().toISOString().split("T")[0],
      };
      setRetailers((prev) => [newRetailer, ...prev]);
    }
  };

  // Toggle status quick-action handler
  const handleToggleStatus = (id: string) => {
    setRetailers((prev) =>
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
  const handleEditClick = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setIsFormOpen(true);
  };

  // Trigger form for Add
  const handleAddClick = () => {
    setSelectedRetailer(null);
    setIsFormOpen(true);
  };

  return (
    <AppShell activePage="Retailers">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Retailers Directory
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Register, manage, status-guard and balance-audit all authorized
              client merchants and e-seva agents from a single real-time
              console.
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Retailer</span>
          </button>
        </div>

        {/* Stats Grid */}
        <RetailerStats retailers={retailers} />

        {/* List Table */}
        <RetailerTable
          retailers={retailers}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleStatus}
        />

        {/* Add/Edit Form Modal */}
        <RetailerForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          retailer={selectedRetailer}
        />
      </section>
    </AppShell>
  );
}
