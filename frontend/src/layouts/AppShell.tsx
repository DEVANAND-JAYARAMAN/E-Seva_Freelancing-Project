"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { CommandBar } from "../components/CommandBar";
import { TopBar } from "./TopBar";
import { BackendHealthChecker } from "../components/BackendHealthChecker";

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
    <div className="min-h-screen bg-slate-50/20 dark:bg-[#070b13]">
      {/* Sidebar navigation */}
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content body */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sleek Top Header (visible on both mobile and desktop) */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Outer content container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Action and Search Command Bar (Desktop top header & mobile details) */}
          {activePage === "Dashboard" && <CommandBar />}

          {/* Page content */}
          <div className="pt-2">
            <BackendHealthChecker>{children}</BackendHealthChecker>
          </div>
        </main>

      </div>
    </div>
  );
}
