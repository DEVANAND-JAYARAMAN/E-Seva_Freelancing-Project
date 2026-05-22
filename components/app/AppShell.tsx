"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { CommandBar } from "./CommandBar";
import { Menu, Leaf } from "lucide-react";

type AppShellProps = {
  activePage?: string;
  children: ReactNode;
};

export function AppShell({ activePage = "Dashboard", children }: AppShellProps) {
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
        {/* Sleek Mobile Top Header (only visible on mobile/tablet) */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-100 dark:border-slate-900/50 bg-white/80 dark:bg-[#090d16]/80 px-4 sm:px-6 lg:hidden backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-855 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005c3a] dark:bg-emerald-600 text-white shadow-sm">
                <Leaf size={14} fill="white" />
              </span>
              <span className="font-extrabold text-slate-800 dark:text-white text-base">Thuruvan</span>
            </div>
          </div>
        </header>

        {/* Outer content container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Action and Search Command Bar (Desktop top header & mobile details) */}
          <CommandBar />

          {/* Page content */}
          <div className="pt-2">{children}</div>
        </main>
      </div>
    </div>
  );
}
