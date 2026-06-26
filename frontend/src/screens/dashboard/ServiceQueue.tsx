"use client";

import { useEffect, useState } from "react";
import { FileText, User, Wallet } from "lucide-react";

export function ServiceQueue() {
  const [servicesData, setServicesData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/services/requests`)
      .then(res => res.json())
      .then(data => {
        const dataArray = Array.isArray(data) ? data : [];
        const sorted = dataArray.sort((a: any, b: any) => 
          new Date(b.createdDate || "").getTime() - new Date(a.createdDate || "").getTime()
        ).slice(0, 5);
        setServicesData(sorted);
      })
      .catch(console.error);
  }, []);

  // Map status styles using tailwind
  const statusClasses: Record<string, string> = {
    Approved:
      "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400",
    Pending:
      "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    "Inprocess":
      "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    "Processing":
      "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    Resubmit:
      "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    Completed:
      "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
  };

  // Map icons and their background colors based on status
  const iconConfig: Record<
    string,
    { icon: typeof FileText; bg: string; text: string }
  > = {
    Approved: {
      icon: FileText,
      bg: "bg-[#e8f5e9] dark:bg-emerald-950/30",
      text: "text-[#005c3a] dark:text-emerald-400",
    },
    Completed: {
      icon: FileText,
      bg: "bg-teal-50 dark:bg-teal-950/30",
      text: "text-teal-600 dark:text-teal-400",
    },
    Pending: {
      icon: FileText,
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
    },
    "Inprocess": {
      icon: User,
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
    },
    "Processing": {
      icon: User,
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
    },
    Resubmit: {
      icon: Wallet,
      bg: "bg-purple-50 dark:bg-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
    },
  };

  return (
    <article className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Recent Updates
        </h2>
      </div>

      <div className="space-y-4">
        {servicesData.map((service) => {
          const statusStyle =
            statusClasses[service.status] ||
            "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300";
          const config = iconConfig[service.status] || {
            icon: FileText,
            bg: "bg-slate-50 dark:bg-slate-900",
            text: "text-slate-500",
          };
          const Icon = config.icon;

          return (
            <div
              className="flex items-center justify-between gap-4 pb-4 border-b border-slate-50 dark:border-slate-900/30 last:pb-0 last:border-b-0"
              key={service.id || service.name || Math.random().toString()}
            >
              {/* Icon, Name & Time */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
                >
                  <Icon size={18} className="stroke-[2.5]" />
                </span>
                <div className="min-w-0">
                  <strong className="block font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight truncate">
                    {service.serviceName || service.name || "Unknown Service"}
                  </strong>
                  <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    {service.createdDate ? new Date(service.createdDate).toLocaleDateString() : (service.time || "Just now")}
                  </span>
                </div>
              </div>

              {/* Status Pill & Amount */}
              <div className="flex items-center gap-6">
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${statusStyle}`}
                >
                  {service.status}
                </span>
                <div className="flex items-baseline gap-0.5 w-16 justify-end">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    ₹{service.cost || service.amount || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
