import { AppShell } from "../AppShell";
import { PlaceholderPage } from "./PlaceholderPage";

export function PermissionPage() {
  return (
    <AppShell activePage="Permission">
      <PlaceholderPage
        eyebrow="Permission"
        title="Permission management"
        description="Manage user roles, service access, approval levels, and staff permissions from this page."
      />
    </AppShell>
  );
}
