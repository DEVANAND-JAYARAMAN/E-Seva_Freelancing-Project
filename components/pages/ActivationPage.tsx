import { AppShell } from "../AppShell";
import { PlaceholderPage } from "./PlaceholderPage";

export function ActivationPage() {
  return (
    <AppShell activePage="Activation">
      <PlaceholderPage
        eyebrow="Activation"
        title="Activation center"
        description="Review activation requests, service readiness, and account enablement workflows here."
      />
    </AppShell>
  );
}
