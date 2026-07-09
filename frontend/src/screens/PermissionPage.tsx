"use client";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { AppShell } from "../layouts/AppShell";
import { Shield, Check, Users, ShieldAlert } from "lucide-react";

const SERVICES_LIST = [
  { id: "pdf-services", name: "PDF Services", category: "Priority" },
  { id: "tnega", name: "TNEGA", category: "Priority" },
  { id: "software-keys", name: "Software Keys", category: "Utility" },
  { id: "msme", name: "MSME", category: "Utility" },
  { id: "ration-card", name: "Ration Card", category: "Utility" },
  { id: "gst", name: "GST", category: "Utility" },
  {
    id: "aadhaar-card-address",
    name: "Aadhaar Card Address",
    category: "Utility",
  },
  { id: "can-edit", name: "CAN Edit", category: "Utility" },
  { id: "rto-services", name: "RTO Services", category: "Utility" },
  { id: "registration-dept", name: "Registration Dept", category: "Utility" },
  { id: "voter-id", name: "Voter ID", category: "Utility" },
  { id: "fssai", name: "FSSAI", category: "Utility" },
  {
    id: "certificate-courses",
    name: "Certificate Courses",
    category: "Utility",
  },
  {
    id: "employment-services",
    name: "Employment Services",
    category: "Utility",
  },
  {
    id: "police-verification",
    name: "Police Verification",
    category: "Utility",
  },
  { id: "utisl-pan", name: "Utisl Pan", category: "Utility" },
  { id: "agri-stack-pdf", name: "Agri Stack PDF", category: "Utility" },
  { id: "pvc-card-print", name: "PVC Card Print", category: "Utility" },
  { id: "cm-health-card", name: "CM Health Card", category: "Utility" },
  { id: "dharsan", name: "Dharsan", category: "Utility" },
];

// Default configuration: all roles can access all services by default
const defaultPermissions: Record<string, string[]> = SERVICES_LIST.reduce(
  (acc, service) => {
    acc[service.id] = ["retailer", "distributor"];
    return acc;
  },
  {} as Record<string, string[]>,
);

export function PermissionPage() {
  const [permissions, setPermissions] = useLocalStorage<
    Record<string, string[]>
  >("thuruvan_service_permissions_matrix", defaultPermissions);

  const togglePermission = (
    serviceId: string,
    role: "retailer" | "distributor",
  ) => {
    setPermissions((prev) => {
      const current = prev[serviceId] || [];
      const updated = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return {
        ...prev,
        [serviceId]: updated,
      };
    });
  };

  return (
    <AppShell activePage="Permission">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div>
            <span className="text-xs font-bold text-[#005c3a] dark:text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={14} />
              <span>Security Panel</span>
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Service Access Control
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Configure and toggle visibility rights for Retailer and
              Distributor accounts. Disabled services will not appear in the
              service directory for those roles.
            </p>
          </div>
        </div>

        {/* Permissions Table Section */}
        <div className="bg-slate-50 dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-50 dark:border-slate-900/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/40 dark:bg-[#090d16]/30 border-b border-slate-50 dark:border-slate-900/30">
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                    Service Name
                  </th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest text-center">
                    Retailer Access
                  </th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest text-center">
                    Distributor Access
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900/30">
                {SERVICES_LIST.map((service) => {
                  const allowedRoles = permissions[service.id] || [];
                  const hasRetailer = allowedRoles.includes("retailer");
                  const hasDistributor = allowedRoles.includes("distributor");

                  return (
                    <tr
                      key={service.id}
                      className="hover:bg-slate-50/30 dark:hover:bg-[#0a0f18]/10 transition-colors"
                    >
                      {/* Service Name */}
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {service.name}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            service.category === "Priority"
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                              : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {service.category}
                        </span>
                      </td>

                      {/* Retailer Access */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            togglePermission(service.id, "retailer")
                          }
                          className={`inline-flex items-center justify-center h-8 w-24 rounded-xl text-xs font-bold transition-all border ${
                            hasRetailer
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          {hasRetailer ? (
                            <span className="flex items-center gap-1">
                              <Check size={13} />
                              Allowed
                            </span>
                          ) : (
                            <span>Denied</span>
                          )}
                        </button>
                      </td>

                      {/* Distributor Access */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            togglePermission(service.id, "distributor")
                          }
                          className={`inline-flex items-center justify-center h-8 w-24 rounded-xl text-xs font-bold transition-all border ${
                            hasDistributor
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          {hasDistributor ? (
                            <span className="flex items-center gap-1">
                              <Check size={13} />
                              Allowed
                            </span>
                          ) : (
                            <span>Denied</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
