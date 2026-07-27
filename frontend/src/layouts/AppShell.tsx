"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BackendHealthChecker } from "../components/BackendHealthChecker";
import { GlobalAlertsDisplay } from "../components/GlobalAlertsDisplay";

type AppShellProps = {
  activePage?: string;
  children: ReactNode;
};

export function AppShell({
  activePage = "Dashboard",
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/80 via-slate-50 to-amber-50/40 dark:from-[#070b13] dark:via-[#070b13] dark:to-[#0a1218]">
      {/* Sidebar navigation */}
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content body */}
      <div className="lg:pl-[16.5rem] flex flex-col min-h-screen">
        {/* Sleek Top Header (visible on both mobile and desktop) */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} activePage={activePage} />

        {activePage === "Dashboard" && <GlobalAlertsDisplay />}

        {/* Outer content container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Page content */}
          <div className="pt-2">
            <BackendHealthChecker>{children}</BackendHealthChecker>
          </div>
        </main>
      </div>
    </div>
  );
}
