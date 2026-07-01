import { useRouter } from "next/navigation";
import { useAuth } from "../../store/context/AuthContext";

export function WalletHealth() {
  const router = useRouter();
  const { user } = useAuth();
  
  const balance = user?.walletBalance || 0;

  return (
    <article className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Left side text details */}
        <div className="flex-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            Wallet health
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready for today
          </h2>
          <div className="text-4xl sm:text-5xl font-extrabold text-[#005c3a] dark:text-emerald-400 tracking-tight mt-4 mb-4">
            ₹{balance.toFixed(2)}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[240px]">
            Main wallet has enough balance for current service flow.
          </p>
        </div>

        {/* Right side illustration */}
        <div className="flex-shrink-0 self-center sm:self-start mt-2 sm:mt-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/wallet_health.png"
            alt="Wallet health illustration"
            className="w-36 h-auto max-h-[140px] object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push("/wallets")}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all duration-200"
        >
          Recharge Main wallet
        </button>
      </div>
    </article>
  );
}
