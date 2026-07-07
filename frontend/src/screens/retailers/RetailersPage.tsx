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
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(
    null,
  );

  // Fetch real data from backend
  const fetchRetailers = async () => {
    try {
      const res = await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/retailers`,
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((user: any) => ({
          id: user.UserId || user.userId,
          name: user.FullName || user.name || "Unknown",
          email: user.Email || user.email,
          phone: user.Mobile || user.mobile,
          city: "Tamil Nadu", // Default
          balance: user.WalletBalance || user.walletBalance || 0,
          status: user.Status || user.status || "Active",
          createdDate: (user.CreatedAt || user.createdAt || "").split("T")[0],
          rawPassword: user.RawPassword || user.rawPassword || "N/A",
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

  // Add / Edit submission handler (Backend save implemented for Add)
  const handleFormSubmit = async (
    data: Omit<Retailer, "id" | "createdDate"> & { id?: string },
  ) => {
    const apiUrl =
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(
        /\/api$/,
        "",
      );
    if (data.id) {
      // Edit mode (API Call)
      try {
        const payload = {
          fullName: data.name,
          email: data.email,
          mobile: data.phone,
          status: data.status,
          rawPassword: data.rawPassword,
          role: "retailer",
        };
        const res = await fetch(`${apiUrl}/api/users/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setRetailers((prev) =>
            prev.map((item) =>
              item.id === data.id ? { ...item, ...data } : item,
            ),
          );
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to edit retailer:", errData);
          alert(errData.error || "Failed to edit retailer");
        }
      } catch (err) {
        console.error("Failed to edit retailer", err);
        alert("Failed to connect to backend");
      }
    } else {
      // Add mode (API Call)
      try {
        const payload = {
          fullName: data.name,
          email: data.email,
          mobile: data.phone,
          role: "retailer",
          password: (data as any).rawPassword,
        };
        const res = await fetch(`${apiUrl}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const result = await res.json();
          const newRetailer: Retailer = {
            ...data,
            id: result.userId || `ret-${Date.now()}`,
            createdDate: new Date().toISOString().split("T")[0],
          };
          setRetailers((prev) => [newRetailer, ...prev]);
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to add retailer:", errData);
          alert(errData.error || "Failed to add retailer");
        }
      } catch (err) {
        console.error("Failed to add retailer", err);
        alert("Failed to connect to backend");
      }
    }
  };

  // Toggle status quick-action handler
  const handleToggleStatus = async (id: string) => {
    const retailer = retailers.find((r) => r.id === id);
    if (!retailer) return;

    const newStatus = retailer.status === "Active" ? "Suspended" : "Active";
    const apiUrl =
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(
        /\/api$/,
        "",
      );

    try {
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, role: "retailer" }),
      });

      if (res.ok) {
        setRetailers((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item,
          ),
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to connect to backend");
    }
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
