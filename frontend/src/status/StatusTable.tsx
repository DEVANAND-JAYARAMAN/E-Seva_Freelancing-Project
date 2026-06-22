import { useState } from "react";
import {
  Search,
  Eye,
  Edit2,
  AlertCircle,
  Phone,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import type { StatusTicket, TicketStatus } from "./types";
import { useAuth } from "../store/context/AuthContext";

type StatusTableProps = {
  tickets: StatusTicket[];
  activeFilter: TicketStatus | "All";
  onSelectTicket: (ticket: StatusTicket, editMode?: boolean) => void;
};

export function StatusTable({
  tickets,
  activeFilter,
  onSelectTicket,
}: StatusTableProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400";
      case "Resubmit":
        return "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400";
      case "Processing":
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400";
      case "Rejected":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400";
      case "Approved":
        return "bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400";
      case "Completed":
        return "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400";
      default:
        return "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400";
    }
  };

  // Filter based on parent filter tab + inner search bar
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.retailerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      activeFilter === "All" ? true : ticket.status === activeFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Service, Transaction ID or Retailer..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-900/80 bg-slate-50/50 dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 dark:focus:ring-emerald-500/20 text-sm font-semibold transition-all duration-200 focus:border-[#005c3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-slate-50 dark:border-slate-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/40 dark:bg-[#090d16]/30 border-b border-slate-50 dark:border-slate-900/30">
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Service
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Retailer / Distributor
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Role
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                Charge (INR)
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Last Updated
              </th>
              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                Status
              </th>

              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900/30">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50/30 dark:hover:bg-[#0a0f18]/10 transition-colors"
                >
                  {/* Service & Txn ID */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {ticket.serviceName}
                    </div>
                  </td>

                  {/* Retailer / Merchant */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {ticket.retailerName}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                        ticket.userRole === "Distributor"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {ticket.userRole || "Retailer"}
                    </span>
                  </td>

                  {/* Charge (INR) */}
                  <td className="py-4 px-6 text-right">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                      ₹{ticket.amount.toFixed(2)}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {ticket.lastUpdated}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase ${getStatusColor(
                        ticket.status,
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSelectTicket(ticket, false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[#005c3a] dark:text-emerald-400 transition-colors"
                        title="View ticket details"
                      >
                        <Eye size={13} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => onSelectTicket(ticket, true)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[#005c3a] dark:text-emerald-400 transition-colors"
                          title="Edit status ticket details"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <AlertCircle
                      size={24}
                      className="text-slate-300 dark:text-slate-700"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      No status tickets found
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Try selecting another status tab or check your query
                      search.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Item Counter */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-2">
        <span>
          Showing {filteredTickets.length} of {tickets.length} total tickets
        </span>
      </div>
    </div>
  );
}
