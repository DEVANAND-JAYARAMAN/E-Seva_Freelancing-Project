"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { RetailerStats } from "./RetailerStats";
import { RetailerTable } from "./RetailerTable";
import { RetailerForm } from "./RetailerForm";
import type { Retailer } from "./types";

// Premium Initial Seed Mockup Data
const initialRetailersList: Retailer[] = [
  {
    id: "ret-1",
    name: "Deva",
    shopName: "Jayaraman Multi Services",
    email: "dev@jayaraman.in",
    phone: "9876543210",
    city: "Chennai",
    balance: 5230.5,
    status: "Active",
    createdDate: "2026-05-10",
    aadhaarNo: "3672 8901 2345",
  },
  {
    id: "ret-2",
    name: "Alam",
    shopName: "Digital Point",
    email: "priya@eseva.org",
    phone: "8765432109",
    city: "Kolkata",
    balance: 12000.0,
    status: "Active",
    createdDate: "2026-05-15",
    aadhaarNo: "4892 0184 7291",
  },
  {
    id: "ret-3",
    name: "Priya Sharma",
    shopName: "Priya Online E-Seva",
    email: "priya@eseva.org",
    phone: "7654321098",
    city: "Mumbai",
    balance: 0.0,
    status: "Suspended",
    createdDate: "2026-05-20",
    aadhaarNo: "9012 3456 7890",
  },
];

export function RetailersPage() {
  const [retailers, setRetailers] = useLocalStorage<Retailer[]>(
    "thuruvan_retailers_list",
    initialRetailersList,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(
    null,
  );

  // Add / Edit submission handler
  const handleFormSubmit = (
    data: Omit<Retailer, "id" | "createdDate"> & { id?: string },
  ) => {
    if (data.id) {
      // Edit mode
      setRetailers((prev) =>
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
      const newRetailer: Retailer = {
        id: `ret-${Date.now()}`,
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
