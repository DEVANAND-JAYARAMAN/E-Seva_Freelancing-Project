"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandBar() {
  const router = useRouter();

  return (
    <section className="flex flex-col md:flex-row md:items-center gap-4 justify-end w-full">
      {/* Primary Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.push("/wallets")}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0c1222]/30 hover:bg-[#f0fdf4]/50 dark:hover:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 font-bold text-sm border border-[#005c3a] dark:border-emerald-600/50 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Money</span>
        </button>
      </div>
    </section>
  );
}
