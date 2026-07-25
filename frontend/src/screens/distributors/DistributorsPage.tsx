"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { DistributorStats } from "./DistributorStats";
import { DistributorTable } from "./DistributorTable";
import { DistributorForm } from "./DistributorForm";
import type { Distributor } from "./types";
import { apiUrl } from "../../utils/apiBase";

export function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] =
    useState<Distributor | null>(null);

  const fetchDistributors = async () => {
    try {
      const res = await fetch(apiUrl("distributors"));
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((user: any) => ({
          id: user.userId || user.UserId || "",
          name: user.FullName || user.name || "Unknown",
          email: user.Email || user.email,
          phone: user.Mobile || user.mobile,
          city: "Tamil Nadu",
          balance: Number(user.walletBalance ?? user.WalletBalance ?? 0),
          status: user.Status || user.status || "Active",
          createdDate: (user.CreatedAt || user.createdAt || "").split("T")[0],
          rawPassword: user.RawPassword || user.rawPassword || "N/A",
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

  const handleFormSubmit = async (
    data: Omit<Distributor, "id" | "createdDate"> & { id?: string },
  ) => {
    if (data.id) {
      try {
        const payload = {
          fullName: data.name,
          email: data.email,
          mobile: data.phone,
          status: data.status,
          rawPassword: data.rawPassword,
          role: "distributor",
        };
        const res = await fetch(apiUrl(`users/${data.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDistributors((prev) =>
            prev.map((item) =>
              item.id === data.id ? { ...item, ...data } : item,
            ),
          );
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to edit distributor:", errData);
          alert(errData.error || "Failed to edit distributor");
        }
      } catch (err) {
        console.error("Failed to edit distributor", err);
        alert("Failed to connect to backend");
      }
    } else {
      try {
        const payload = {
          fullName: data.name,
          email: data.email,
          mobile: data.phone,
          role: "distributor",
          password: (data as any).rawPassword,
        };
        const res = await fetch(apiUrl("auth/signup"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const result = await res.json();
          const newDistributor: Distributor = {
            ...data,
            id: result.userId || result.UserId || `dist-${Date.now()}`,
            createdDate: new Date().toISOString().split("T")[0],
          };
          setDistributors((prev) => [newDistributor, ...prev]);
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to add distributor:", errData);
          alert(errData.error || "Failed to add distributor");
        }
      } catch (err) {
        console.error("Failed to add distributor", err);
        alert("Failed to connect to backend");
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const distributor = distributors.find((d) => d.id === id);
    if (!distributor) return;

    const newStatus = distributor.status === "Active" ? "Suspended" : "Active";

    try {
      const res = await fetch(apiUrl(`users/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, role: "distributor" }),
      });

      if (res.ok) {
        setDistributors((prev) =>
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

  const handleAddMoney = async (userId: string, amount: number) => {
    try {
      const res = await fetch(apiUrl("admin/wallet/credit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const newBal =
          data.walletBalance != null ? Number(data.walletBalance) : null;
        if (newBal != null && !Number.isNaN(newBal)) {
          setDistributors((prev) =>
            prev.map((item) =>
              item.id === userId ? { ...item, balance: newBal } : item,
            ),
          );
        } else {
          await fetchDistributors();
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to add money", err);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl(`users/${id}`)}?role=distributor`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDistributors((prev) => prev.filter((item) => item.id !== id));
        return true;
      }
      const errData = await res.json().catch(() => ({}));
      console.error("Failed to delete distributor:", res.status, errData);
      return false;
    } catch (err) {
      console.error("Failed to delete distributor", err);
      return false;
    }
  };

  const handleEditClick = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedDistributor(null);
    setIsFormOpen(true);
  };

  return (
    <AppShell activePage="Distributors">
      <section className="flex flex-col gap-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Distributor</span>
          </button>
        </div>

        <DistributorStats distributors={distributors} />

        <DistributorTable
          distributors={distributors}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleStatus}
          onAddMoney={handleAddMoney}
          onDelete={handleDelete}
        />

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
