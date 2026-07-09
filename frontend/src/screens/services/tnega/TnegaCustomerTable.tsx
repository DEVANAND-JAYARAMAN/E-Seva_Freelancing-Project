import { useState } from "react";
import {
  Search,
  Edit,
  UserX,
  UserCheck,
  AlertCircle,
  Phone,
  Fingerprint,
  MapPin,
  Calendar,
  Layers,
} from "lucide-react";
import type { TnegaCustomer } from "./types";

type TnegaCustomerTableProps = {
  customers: TnegaCustomer[];
  onEdit: (customer: TnegaCustomer) => void;
  onTnegaAction: (customer: TnegaCustomer) => void;
  onToggleStatus?: (id: string) => void;
};

export function TnegaCustomerTable({
  customers,
  onEdit,
  onTnegaAction,
  onToggleStatus,
}: TnegaCustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Suspended"
  >("All");

  // Filter customers based on search and status selects
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.district &&
        customer.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.taluk &&
        customer.taluk.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" ? true : customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
      {/* Search and Filter Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, ID, phone or location..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-900/80 bg-slate-50/50 dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 dark:focus:ring-emerald-500/20 text-sm font-semibold transition-all duration-200 focus:border-[#005c3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:inline">
            Status:
          </label>
          <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
            {(["All", "Active", "Suspended"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  statusFilter === filter
                    ? "bg-slate-50 dark:bg-[#090d16] text-[#005c3a] dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-850/50"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-slate-50 dark:border-slate-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/40 dark:bg-[#090d16]/30 border-b border-slate-50 dark:border-slate-900/30">
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Customer Name & ID
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                DOB & Gender
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Contact & Aadhaar
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Location & VAO
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                Status
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900/30">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/30 dark:hover:bg-[#0a0f18]/10 transition-colors"
                >
                  {/* Customer Name & ID */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005c3a]/5 dark:bg-emerald-500/5 text-[#005c3a] dark:text-emerald-400 font-extrabold text-sm border border-[#005c3a]/10 dark:border-emerald-500/10">
                        {customer.applicantName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div
                          className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:underline cursor-pointer"
                          onClick={() => onEdit(customer)}
                        >
                          {customer.applicantName}
                        </div>
                        <div className="text-xs font-semibold text-[#005c3a] dark:text-emerald-400/80">
                          ID: {customer.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* DOB & Gender */}
                  <td className="py-4 px-6 space-y-1">
                    {customer.dob && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{customer.dob}</span>
                      </div>
                    )}
                    {customer.gender && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-450">
                        <Layers size={12} className="text-slate-400" />
                        <span>{customer.gender}</span>
                      </div>
                    )}
                  </td>

                  {/* Contact & Aadhaar */}
                  <td className="py-4 px-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Phone size={12} className="text-slate-400" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.aadhaarNo && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Fingerprint
                          size={12}
                          className="text-[#005c3a] dark:text-emerald-400 shrink-0"
                        />
                        <span className="font-mono">{customer.aadhaarNo}</span>
                      </div>
                    )}
                  </td>

                  {/* Location & VAO */}
                  <td className="py-4 px-6 space-y-1">
                    {(customer.district || customer.taluk) && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <MapPin size={13} className="text-slate-400" />
                        <span>
                          {customer.district}
                          {customer.taluk && `, ${customer.taluk}`}
                        </span>
                      </div>
                    )}
                    {customer.vao && (
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-4.5">
                        VAO: {customer.vao}
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase ${
                        customer.status === "Active"
                          ? "bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(customer)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                        title="Edit profile"
                      >
                        <Edit size={13} />
                      </button>

                      {/* Status toggle action */}
                      <button
                        onClick={() => {
                          if (onToggleStatus) {
                            onToggleStatus(customer.id);
                          } else {
                            onTnegaAction(customer);
                          }
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                          customer.status === "Active"
                            ? "border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-rose-500 hover:text-rose-600"
                            : "border-emerald-100 dark:border-emerald-900/30 hover:bg-[#e8f5e9] dark:hover:bg-emerald-950/20 text-emerald-600 hover:text-[#005c3a]"
                        }`}
                        title={
                          customer.status === "Active"
                            ? "Suspend customer"
                            : "Activate customer"
                        }
                      >
                        {customer.status === "Active" ? (
                          <UserX size={13} />
                        ) : (
                          <UserCheck size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <AlertCircle
                      size={24}
                      className="text-slate-300 dark:text-slate-700"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      No customers found
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Try adjusting your search criteria or register a new one.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Item Counter */}
      <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-2">
        <span>
          SHOWING {filteredCustomers.length} OF {customers.length} CUSTOMERS
        </span>
      </div>
    </div>
  );
}
