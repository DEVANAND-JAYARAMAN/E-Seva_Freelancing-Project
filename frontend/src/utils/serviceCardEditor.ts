import Swal from "sweetalert2";

export type ServiceCardEditData = {
  name: string;
  logoUrl?: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Admin dialog: rename service + change logo (URL or upload) */
export async function openServiceCardEditor(
  current: ServiceCardEditData,
): Promise<ServiceCardEditData | null> {
  const result = await Swal.fire({
    title: "Edit Service Card",
    html: `
      <div style="display:flex;flex-direction:column;gap:14px;text-align:left;padding:6px 4px;">
        <div>
          <label style="font-size:11px;font-weight:800;text-transform:uppercase;color:#64748b;">Service Name</label>
          <input id="swal-svc-name" class="swal2-input" placeholder="Service name"
            style="margin:6px 0 0 0;width:100%;height:40px;font-size:14px;border-radius:10px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:11px;font-weight:800;text-transform:uppercase;color:#64748b;">Logo Image URL (optional)</label>
          <input id="swal-svc-logo-url" class="swal2-input" placeholder="https://... or leave empty"
            style="margin:6px 0 0 0;width:100%;height:40px;font-size:14px;border-radius:10px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:11px;font-weight:800;text-transform:uppercase;color:#64748b;">Or Upload Logo</label>
          <input id="swal-svc-logo-file" type="file" accept="image/*"
            style="margin:8px 0 0 0;width:100%;font-size:13px;" />
        </div>
        <p style="margin:0;font-size:11px;color:#94a3b8;">Upload replaces URL. Clear URL and skip upload to remove custom logo.</p>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save",
    confirmButtonColor: "#005c3a",
    cancelButtonColor: "#6c757d",
    didOpen: () => {
      const nameEl = document.getElementById(
        "swal-svc-name",
      ) as HTMLInputElement | null;
      const urlEl = document.getElementById(
        "swal-svc-logo-url",
      ) as HTMLInputElement | null;
      if (nameEl) nameEl.value = current.name || "";
      if (urlEl) urlEl.value = current.logoUrl || "";
    },
    preConfirm: async () => {
      const name = (
        document.getElementById("swal-svc-name") as HTMLInputElement | null
      )?.value?.trim();
      const logoUrlInput = (
        document.getElementById("swal-svc-logo-url") as HTMLInputElement | null
      )?.value?.trim();
      const fileInput = document.getElementById(
        "swal-svc-logo-file",
      ) as HTMLInputElement | null;
      const file = fileInput?.files?.[0];

      if (!name) {
        Swal.showValidationMessage("Service name is required");
        return false;
      }

      let logoUrl = logoUrlInput || undefined;
      if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
          Swal.showValidationMessage("Logo must be under 1.5 MB");
          return false;
        }
        try {
          logoUrl = await fileToDataUrl(file);
        } catch {
          Swal.showValidationMessage("Could not read logo file");
          return false;
        }
      }

      return { name, logoUrl } as ServiceCardEditData;
    },
  });

  if (result.isConfirmed && result.value) {
    return result.value as ServiceCardEditData;
  }
  return null;
}
