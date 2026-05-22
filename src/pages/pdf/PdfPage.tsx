import { AppShell } from "../../layouts/AppShell";
import { PlaceholderPage } from "../PlaceholderPage";

export function PdfPage() {
  return (
    <AppShell activePage="PDF">
      <PlaceholderPage
        eyebrow="PDF"
        title="PDF documents"
        description="Create, download, and review generated service PDFs from one document workspace."
      />
    </AppShell>
  );
}
