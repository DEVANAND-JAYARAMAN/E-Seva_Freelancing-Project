"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../layouts/AppShell";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { TnegaCustomerTable } from "./TnegaCustomerTable";
import { TnegaCustomerForm } from "./TnegaCustomerForm";
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
                applicantName: data.applicantName,
                dob: data.dob,
                gender: data.gender,
                phone: data.phone,
                district: data.district,
                taluk: data.taluk,
                vao: data.vao,
                photo: data.photo,
                aadhaarNo: data.aadhaarNo,
                aadhaarCard: data.aadhaarCard,
                smartCardNo: data.smartCardNo,
                smartCard: data.smartCard,
                signature: data.signature,
                address: data.address,
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
      <section className="flex flex-col gap-6 w-full">
        {/* Header Block exactly matching screenshot */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/30 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-white leading-tight">
              Customer
            </h2>
            <span className="text-slate-300 dark:text-slate-700 text-lg select-none">
              |
            </span>
            <Link
              href="/dashboard"
              className="text-[#007bff] hover:text-[#0056b3] transition-colors"
              title="Home"
            >
              <Home size={18} />
            </Link>
          </div>

          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#007bff] hover:bg-[#0056b3] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
          >
            Add Customers
          </button>
        </div>

        {/* List Table */}
        <TnegaCustomerTable
          customers={customers}
          onEdit={handleEditClick}
          onTnegaAction={handleTnegaAction}
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
