"use client";

import { useState } from "react";
import { Home, Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../layouts/AppShell";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { TnegaCustomerTable } from "./TnegaCustomerTable";
import { TnegaCustomerForm } from "./TnegaCustomerForm";
import { TnegaStats } from "./TnegaStats";
import type { TnegaCustomer } from "./types";

// Seed data to match user's screenshot exactly
const initialTnegaCustomers: TnegaCustomer[] = [
  {
    id: "C632",
    applicantName: "TEST",
    dob: "1995-05-15",
    gender: "Male",
    phone: "8525957812",
    district: "Chennai",
    taluk: "Mylapore",
    vao: "VAO-123",
    photo: "",
    aadhaarNo: "8525 9578 1234",
    aadhaarCard: "",
    smartCardNo: "SC987654321",
    smartCard: "",
    signature: "",
    address: "Test Address, Chennai",
    status: "Active",
    createdDate: "2026-06-06",
  },
];

export function TnegaPage() {
  const [customers, setCustomers] = useLocalStorage<TnegaCustomer[]>(
    "thuruvan_tnega_customers_list",
    initialTnegaCustomers,
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<TnegaCustomer | null>(null);

  // Form submission handler
  const handleFormSubmit = (
    data: Omit<TnegaCustomer, "id" | "createdDate" | "status"> & {
      id?: string;
    },
  ) => {
    if (data.id) {
      // Edit mode
      setCustomers((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                ...data,
              }
            : item,
        ),
      );
    } else {
      // Add mode
      // Generate ID like C633, C634...
      const nextIdNum =
        customers.length > 0
          ? Math.max(
              ...customers.map((c) => {
                const num = parseInt(c.id.replace(/\D/g, ""));
                return isNaN(num) ? 600 : num;
              }),
            ) + 1
          : 632;
      const nextId = `C${nextIdNum}`;

      const newCustomer: TnegaCustomer = {
        ...data,
        id: nextId,
        status: "Active",
        createdDate: new Date().toISOString().split("T")[0],
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }
  };

  const handleToggleStatus = (id: string) => {
    setCustomers((prev) =>
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

  const handleEditClick = (customer: TnegaCustomer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleTnegaAction = (customer: TnegaCustomer) => {
    // Show Tnega Action or edit
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block matching Retailer style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                TNEGA Customer Directory
              </h2>
              <span className="text-slate-300 dark:text-slate-700 text-lg select-none">
                |
              </span>
              <Link
                href="/dashboard"
                className="text-[#005c3a] dark:text-emerald-450 hover:text-[#004d30] dark:hover:text-emerald-350 transition-colors"
                title="Home"
              >
                <Home size={18} />
              </Link>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Register, manage, and edit customer applications for TNEGA E-Seva
              services from a single real-time console.
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Customers</span>
          </button>
        </div>

        {/* Stats Grid */}
        <TnegaStats customers={customers} />

        {/* List Table */}
        <TnegaCustomerTable
          customers={customers}
          onEdit={handleEditClick}
          onTnegaAction={handleTnegaAction}
          onToggleStatus={handleToggleStatus}
        />

        {/* Form Modal */}
        <TnegaCustomerForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          customer={selectedCustomer}
        />
      </section>
    </AppShell>
  );
}
