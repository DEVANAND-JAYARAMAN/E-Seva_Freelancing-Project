import { AppShell } from "../AppShell";
import { PlaceholderPage } from "./PlaceholderPage";

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
