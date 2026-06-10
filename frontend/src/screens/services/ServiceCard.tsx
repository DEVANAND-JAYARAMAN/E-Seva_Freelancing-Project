import { ReactNode } from "react";
import { Pencil } from "lucide-react";

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
  isManageMode?: boolean;
  allowedRoles?: string[];
  onToggleRole?: (role: "retailer" | "distributor") => void;
  isAdmin?: boolean;
  onEditClick?: () => void;
}

export function ServiceCard({
  id,
  name,
  subName,
  icon,
  onClick,
  layout = "vertical",
  price,
  isManageMode = false,
  allowedRoles = [],
  onToggleRole,
  isAdmin = false,
  onEditClick,
}: ServiceCardProps) {
  if (layout === "horizontal") {
    return (
      <article
        onClick={isManageMode ? undefined : onClick}
        className={`bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex items-center gap-5 border-l-4 border-l-transparent transition-all duration-300 relative ${
          isManageMode
            ? "border-amber-400 dark:border-amber-500/50"
            : "hover:shadow-md cursor-pointer group hover:border-l-[#005c3a] dark:hover:border-l-emerald-400 hover:translate-y-[-2px]"
        }`}
      >
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.();
            }}
            style={{ position: "absolute", top: "12px", right: "12px" }}
            className="z-10 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-400 hover:text-[#005c3a] dark:hover:text-emerald-400 transition-all active:scale-[0.95]"
            title="Edit card details"
          >
            <Pencil size={11} />
          </button>
        )}

        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <div className="transition-transform duration-300 flex items-center justify-center group-hover:scale-105">
            {icon}
          </div>
          {isManageMode && (
            <div
              className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-150 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-bold text-slate-500 uppercase select-none">
                <input
                  type="checkbox"
                  checked={allowedRoles.includes("retailer")}
                  onChange={() => onToggleRole?.("retailer")}
                  className="h-3 w-3 rounded text-[#005c3a] focus:ring-[#005c3a]"
                />
                Retailer
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-bold text-slate-500 uppercase select-none">
                <input
                  type="checkbox"
                  checked={allowedRoles.includes("distributor")}
                  onChange={() => onToggleRole?.("distributor")}
                  className="h-3 w-3 rounded text-[#005c3a] focus:ring-[#005c3a]"
                />
                Distributor
              </label>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h4
            className={`font-extrabold transition-colors text-sm uppercase tracking-wide ${
              isManageMode
                ? "text-slate-800 dark:text-white"
                : "text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400"
            }`}
          >
            {name}
          </h4>
          {subName && (
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-555 uppercase">
              {subName}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={isManageMode ? undefined : onClick}
      className={`bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-2 relative overflow-hidden transition-all duration-300 ${
        isManageMode
          ? "border-amber-400 dark:border-amber-500/50"
          : "hover:shadow-md cursor-pointer group hover:translate-y-[-4px]"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/10 to-transparent dark:from-slate-900/5 dark:to-transparent pointer-events-none" />

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
          style={{ position: "absolute", top: "12px", right: "12px" }}
          className="z-10 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-400 hover:text-[#005c3a] dark:hover:text-emerald-400 transition-all active:scale-[0.95]"
          title="Edit card details"
        >
          <Pencil size={11} />
        </button>
      )}

      <div className="h-20 w-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>

      <div className="space-y-1.5">
        <h4
          className={`font-extrabold transition-colors text-sm leading-snug ${
            isManageMode
              ? "text-slate-800 dark:text-white"
              : "text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400"
          }`}
        >
          {name}
        </h4>
        {subName && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
            {subName}
          </p>
        )}
      </div>

      {isManageMode && (
        <div
          className="mt-4 w-full flex justify-around gap-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-150 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-500 uppercase select-none">
            <input
              type="checkbox"
              checked={allowedRoles.includes("retailer")}
              onChange={() => onToggleRole?.("retailer")}
              className="rounded text-[#005c3a] focus:ring-[#005c3a]"
            />
            Retailer
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-500 uppercase select-none">
            <input
              type="checkbox"
              checked={allowedRoles.includes("distributor")}
              onChange={() => onToggleRole?.("distributor")}
              className="rounded text-[#005c3a] focus:ring-[#005c3a]"
            />
            Distributor
          </label>
        </div>
      )}
    </article>
  );
}
