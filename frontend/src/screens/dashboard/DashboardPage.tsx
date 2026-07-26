"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { AppShell } from "../../layouts/AppShell";
import { ServiceQueue } from "./ServiceQueue";
import { PartnersMetricCard } from "./PartnersOverview";
import { StatsGrid } from "./StatsGrid";
import { WalletSummary } from "./WalletSummary";
import { useAuth } from "../../store/context/AuthContext";
import { DashboardPage2 } from "./DashboardPage2";
import { apiUrl, authFetch } from "../../utils/apiBase";

export function DashboardPage({
  forceRole,
}: {
  forceRole?: "admin" | "retailer" | "distributor";
}) {
  const { user, updateWallet } = useAuth();
  const role = forceRole || user?.role;
  const [stats, setStats] = useState<any>(null);
  const [resetting, setResetting] = useState(false);

  const loadStats = useCallback(() => {
    authFetch(apiUrl("admin/dashboard"), { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          await Swal.fire({
            icon: "warning",
            title: "Admin session expired",
            text: "Please logout and login again with your real admin email and password.",
            confirmButtonColor: "#005c3a",
          });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
          return null;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Dashboard stats failed", errData);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || data.error) return;
        setStats(data);
        if (typeof data?.adminWalletBalance === "number") {
          updateWallet(Number(data.adminWalletBalance));
        }
      })
      .catch((err) => console.error("Failed to load dashboard stats", err));
  }, [updateWallet]);

  useEffect(() => {
    if (role === "admin") {
      loadStats();
    }
  }, [role, loadStats]);

  const handleStartNew = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Start New?",
      html: "This will <b>delete all Services Status files</b> (Pending / Approved / Rejected). Dashboard counts start fresh. <b>Wallets stay</b>. Logins stay.",
      showCancelButton: true,
      confirmButtonText: "Yes, Clear Status",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0f766e",
    });
    if (!confirm.isConfirmed) return;

    setResetting(true);
    try {
      const res = await authFetch(apiUrl("admin/dashboard/reset"), {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Reset failed",
          text: data.error || "Could not clear Services Status",
        });
        return;
      }
      loadStats();
      await Swal.fire({
        icon: "success",
        title: "Services Status cleared",
        text: `Deleted ${data.appsDeleted ?? 0} files. Wallets unchanged.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not reach server",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleShowAllCounts = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Show all counts?",
      text: "Dashboard will count every application again (not only after Start New).",
      showCancelButton: true,
      confirmButtonText: "Show all",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0f766e",
    });
    if (!confirm.isConfirmed) return;

    setResetting(true);
    try {
      const res = await authFetch(apiUrl("admin/dashboard/clear-reset"), {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Restore failed",
          text: data.error || "Could not restore dashboard counts",
        });
        return;
      }
      loadStats();
      await Swal.fire({
        icon: "success",
        title: "Restored",
        text: "Dashboard shows full application history again.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not reach server",
      });
    } finally {
      setResetting(false);
    }
  };

  // Fail closed: only admin sees admin dashboard
  if (role !== "admin") {
    return (
      <DashboardPage2
        forceRole={role === "distributor" ? "distributor" : "retailer"}
      />
    );
  }

  return (
    <AppShell activePage="Dashboard">
      <section className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            {stats?.dashboardResetAt ? (
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Counts from{" "}
                {new Date(stats.dashboardResetAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {stats?.dashboardResetAt ? (
              <button
                type="button"
                onClick={handleShowAllCounts}
                disabled={resetting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 text-slate-800 dark:text-slate-100 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide shadow-sm transition-colors"
              >
                Show all counts
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleStartNew}
              disabled={resetting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] hover:bg-[#0d9488] disabled:opacity-60 text-white px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide shadow-sm transition-colors"
            >
              <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
              {resetting ? "Starting…" : "Start New"}
            </button>
          </div>
        </div>

        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          aria-label="Wallet and metrics summary"
        >
          <WalletSummary stats={stats} />
          <StatsGrid stats={stats} />
          <PartnersMetricCard
            retailers={Number(stats?.retailers ?? 0)}
            distributors={Number(stats?.distributors ?? 0)}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-3">
            <ServiceQueue since={stats?.dashboardResetAt} />
          </div>
        </section>
      </section>
    </AppShell>
  );
}
