import { AppShell } from "../AppShell";
import { PlaceholderPage } from "./PlaceholderPage";

export function PaymentsPage() {
  return (
    <AppShell activePage="Payments">
      <PlaceholderPage
        eyebrow="Payments"
        title="Payment management"
        description="Handle wallet additions, payment requests, collections, and settlement activity."
      />
    </AppShell>
  );
}
