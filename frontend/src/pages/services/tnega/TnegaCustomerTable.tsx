import { useState } from "react";
import { Search, Edit } from "lucide-react";
import type { TnegaCustomer } from "./types";

type TnegaCustomerTableProps = {
  customers: TnegaCustomer[];
  onEdit: (customer: TnegaCustomer) => void;
  onTnegaAction: (customer: TnegaCustomer) => void;
};

export function TnegaCustomerTable({
  customers,
  onEdit,
  onTnegaAction,
}: TnegaCustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.id.toLowerCase().includes(term) ||
      customer.applicantName.toLowerCase().includes(term) ||
      customer.phone.includes(term)
    );
  });

  // Pagination calculations
  const totalEntries = filteredCustomers.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
      {/* Search and Limit Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Entries select dropdown */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 focus:border-[#005c3a]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Search:
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-4 pr-10 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 focus:border-[#005c3a] text-sm font-semibold text-slate-800 dark:text-slate-200"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <Search size={15} />
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-900/30">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-[#090d16]/30 border-b border-slate-100 dark:border-slate-900/30">
              <th className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-slate-100 w-1/4">
                User Id
              </th>
              <th className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-slate-100 w-1/3">
                Name
              </th>
              <th className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-slate-100 w-1/4">
                Phone
              </th>
              <th className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-slate-100 text-center w-1/4">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900/30">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/30 dark:hover:bg-[#0a0f18]/10 transition-colors"
                >
                  {/* User Id */}
                  <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-350 text-sm">
                    {customer.id}
                  </td>

                  {/* Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {/* BSNL logo style icon */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 font-black text-[10px] tracking-tighter uppercase shrink-0 select-none">
                        BSNL
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer">
                        {customer.applicantName}
                      </span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-350 text-sm">
                    {customer.phone}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(customer)}
                        className="px-4 py-1.5 rounded-lg bg-[#007bff] hover:bg-[#0056b3] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onTnegaAction(customer)}
                        className="px-4 py-1.5 rounded-lg bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                      >
                        TNEGA
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-slate-400 text-sm font-semibold"
                >
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Item Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Showing {totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of{" "}
          {totalEntries} entries
        </span>

        {/* Prev / Pages / Next */}
        <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-900/50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                currentPage === page
                  ? "bg-[#007bff] text-white"
                  : "bg-white dark:bg-transparent text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-900/50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
