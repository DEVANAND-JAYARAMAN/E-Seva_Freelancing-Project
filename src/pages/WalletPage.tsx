import { AppShell } from "../layouts/AppShell";
import { PlaceholderPage } from "./PlaceholderPage";

export function WalletPage() {
  return (
    <AppShell activePage="Wallet">
      <PlaceholderPage
        eyebrow="Wallet"
        title="Wallet overview"
        description="Monitor main wallet balance, API wallet balance, recharge history, and wallet requests."
      />
    </AppShell>
  );
}
