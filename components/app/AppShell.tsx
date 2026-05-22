import type { ReactNode } from "react";
import { CommandBar } from "./CommandBar";
import { TopBar } from "./TopBar";

type AppShellProps = {
  activePage?: string;
  children: ReactNode;
};

export function AppShell({ activePage = "Dashboard", children }: AppShellProps) {
  return (
    <main className="app-shell">
      <TopBar activePage={activePage} />
      <CommandBar />
      {children}
    </main>
  );
}
