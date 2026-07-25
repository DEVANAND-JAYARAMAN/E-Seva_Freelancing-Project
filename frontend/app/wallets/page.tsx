"use client";

import { useAuth } from "../../src/store/context/AuthContext";
import { WalletPage } from "../../src/screens/WalletPage";
import { AdminWalletPage } from "../../src/screens/WalletPageAdmin";

export default function WalletsRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
        Loading wallet…
      </div>
    );
  }
  if (user?.role === "admin") {
    return <AdminWalletPage />;
  }
  return <WalletPage />;
}
