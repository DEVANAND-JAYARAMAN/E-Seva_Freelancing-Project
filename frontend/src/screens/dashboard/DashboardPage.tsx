"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "../../layouts/AppShell";
import { ServiceQueue } from "./ServiceQueue";
import {
  PartnersOverview,
  PartnersMetricCard,
} from "./PartnersOverview";
import { StatsGrid } from "./StatsGrid";
import { WalletSummary } from "./WalletSummary";
import { useAuth } from "../../store/context/AuthContext";
import { DashboardPage2 } from "./DashboardPage2";

export function DashboardPage({
  forceRole,
}: {
  forceRole?: "admin" | "retailer" | "distributor";
}) {
  const { user, updateWallet } = useAuth();
  const role = forceRole || user?.role;
  const [stats, setStats] = useState<any>(null);
  const [partnerCounts, setPartnerCounts] = useState({
    retailers: 0,
    distributors: 0,
  });

  const handlePartnerCounts = useCallback(
    (c: { retailers: number; distributors: number }) => {
      setPartnerCounts(c);
    },
    [],
  );

  useEffect(() => {
    if (role === "admin") {
      fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "https://api.thuruvancommunications.com").replace(/(?:\/api|\/)+$/, "")}/api/admin/dashboard`,
      )
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          if (typeof data?.adminWalletBalance === "number") {
            updateWallet(Number(data.adminWalletBalance));
          }
          // Prefer dashboard counts until partners overview loads
          setPartnerCounts((prev) => ({
            retailers: Number(data?.retailers ?? prev.retailers ?? 0),
            distributors: Number(data?.distributors ?? prev.distributors ?? 0),
          }));
        })
        .catch((err) => console.error("Failed to load dashboard stats", err));
    }
  }, [role, updateWallet]);

  const scrollToPartners = () => {
    document
      .getElementById("partners-services-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        {/* First-image style metric cards grid */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          aria-label="Wallet and metrics summary"
        >
          <WalletSummary stats={stats} />
          <StatsGrid stats={stats} />
          <PartnersMetricCard
            retailers={partnerCounts.retailers}
            distributors={partnerCounts.distributors}
            onClick={scrollToPartners}
          />
        </section>

        {/* Colored Partners card — second-image details inside */}
        <section className="w-full" aria-label="Partners and services overview">
          <PartnersOverview onCounts={handlePartnerCounts} />
        </section>

        {/* Live Queues */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-3">
            <ServiceQueue />
          </div>
        </section>
      </section>
    </AppShell>
  );
}
