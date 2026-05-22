import { AppShell } from "../layouts/AppShell";
import { PlaceholderPage } from "../pages/PlaceholderPage";

export function StatusPage() {
  return (
    <AppShell activePage="Status">
      <PlaceholderPage
        eyebrow="Status"
        title="Service status"
        description="Track pending, approved, rejected, and resubmitted service requests in a focused status view."
      />
    </AppShell>
  );
}
