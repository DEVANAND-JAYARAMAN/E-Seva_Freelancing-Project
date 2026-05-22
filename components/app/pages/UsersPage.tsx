import { AppShell } from "../AppShell";
import { PlaceholderPage } from "./PlaceholderPage";

export function UsersPage() {
  return (
    <AppShell activePage="Users">
      <PlaceholderPage
        eyebrow="Users"
        title="User management"
        description="Manage customers, retailers, distributors, and internal users with separate workflows."
      />
    </AppShell>
  );
}
