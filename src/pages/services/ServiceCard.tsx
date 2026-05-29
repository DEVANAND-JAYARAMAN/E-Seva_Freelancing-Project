import { ReactNode } from "react";

interface ServiceCardProps {
  id: string;
  name: string;
  subName?: string;
  icon: ReactNode;
  onClick: () => void;
  layout?: "vertical" | "horizontal";
  price?: {
    retailer: string | number;
    distributor: string | number;
  };
}

export function ServiceCard({
  id,
  name,
  subName,
  icon,
  onClick,
  layout = "vertical",
  price,
}: ServiceCardProps) {
  if (layout === "horizontal") {
    return (
      <article
        onClick={onClick}
        className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 flex items-center gap-5 border-l-4 border-l-transparent hover:border-l-[#005c3a] dark:hover:border-l-emerald-400 hover:translate-y-[-2px]"
      >
        <div className="shrink-0 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400 transition-colors text-sm uppercase tracking-wide">
            {name}
          </h4>
          {subName && (
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
              {subName}
            </p>
          )}
          {price && (
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                R: ₹{price.retailer}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                D: ₹{price.distributor}
              </span>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={onClick}
      className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 flex flex-col items-center text-center gap-4 relative overflow-hidden hover:translate-y-[-4px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/10 to-transparent dark:from-slate-900/5 dark:to-transparent pointer-events-none" />
      
      <div className="h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      <div className="space-y-1.5 mt-1">
        <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400 transition-colors text-sm leading-snug">
          {name}
        </h4>
        {subName && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {subName}
          </p>
        )}
        {price && (
          <div className="flex flex-wrap justify-center gap-2 mt-2 pt-1">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              R: ₹{price.retailer}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
              D: ₹{price.distributor}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
