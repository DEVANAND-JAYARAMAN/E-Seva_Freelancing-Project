import { apiUrl, authFetch } from "./apiBase";

export type PricingRole = "admin" | "retailer" | "distributor" | "customer";

export type PricingRow = {
  id: string;
  name: string;
  adminPrice?: number;
  distributorPrice?: number;
  retailerPrice?: number;
  othersiteAdminPrice?: number;
  customerPrice?: number;
  needCoordinator?: boolean;
};

export type PricingMatrix = Record<string, PricingRow[]>;

const STORAGE_KEY = "thuruvan_service_pricing_matrix_v2";

let memoryCache: PricingMatrix | null = null;
let inflight: Promise<PricingMatrix> | null = null;

function normalize(s: string): string {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readLocalMatrix(): PricingMatrix {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalMatrix(matrix: PricingMatrix) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
  } catch {
    /* ignore quota */
  }
}

export function priceForRole(row: PricingRow | null | undefined, role: PricingRole): number {
  if (!row) return 0;
  if (role === "distributor") {
    return Number(row.distributorPrice ?? row.retailerPrice ?? 0) || 0;
  }
  if (role === "admin") {
    return Number(row.adminPrice ?? row.retailerPrice ?? 0) || 0;
  }
  if (role === "customer") {
    return Number(row.customerPrice ?? row.retailerPrice ?? 0) || 0;
  }
  return Number(row.retailerPrice ?? 0) || 0;
}

/** Find a pricing row by category + service id/name (fuzzy). */
export function findPricingRow(
  matrix: PricingMatrix,
  opts: {
    categoryId?: string;
    serviceId?: string;
    serviceName?: string;
  },
): PricingRow | null {
  const categoryId = opts.categoryId?.trim();
  const sid = normalize(opts.serviceId || "");
  const sname = normalize(opts.serviceName || "");

  const searchLists = (): PricingRow[][] => {
    if (categoryId && Array.isArray(matrix[categoryId])) {
      return [matrix[categoryId]];
    }
    return Object.values(matrix).filter(Array.isArray) as PricingRow[][];
  };

  for (const list of searchLists()) {
    if (sid) {
      const byId = list.find((r) => normalize(r.id) === sid);
      if (byId) return byId;
    }
    if (sname) {
      const byName = list.find((r) => normalize(r.name) === sname);
      if (byName) return byName;
      const partial = list.find(
        (r) =>
          normalize(r.name).includes(sname) ||
          sname.includes(normalize(r.name)),
      );
      if (partial) return partial;
    }
  }

  // If category given but no name match, use first / *-main row as category default
  if (categoryId && Array.isArray(matrix[categoryId]) && matrix[categoryId].length) {
    const list = matrix[categoryId];
    const main = list.find((r) => /main$/i.test(r.id) || normalize(r.id) === normalize(categoryId));
    return main || list[0];
  }

  return null;
}

export function resolveServiceCharge(
  matrix: PricingMatrix,
  opts: {
    categoryId?: string;
    serviceId?: string;
    serviceName?: string;
    role: PricingRole;
    fallback?: number;
  },
): number {
  const row = findPricingRow(matrix, opts);
  const fromMatrix = priceForRole(row, opts.role);
  if (fromMatrix > 0) return fromMatrix;
  return Number(opts.fallback || 0) || 0;
}

/** Category card display prices (retailer + distributor) from matrix. */
export function categoryCardPrices(
  matrix: PricingMatrix,
  categoryId: string,
): { retailer: number; distributor: number } | null {
  const list = matrix[categoryId];
  if (!Array.isArray(list) || !list.length) return null;
  const main =
    list.find((r) => /main$/i.test(r.id)) ||
    list.find((r) => normalize(r.id) === normalize(categoryId)) ||
    list[0];
  return {
    retailer: Number(main.retailerPrice || 0) || 0,
    distributor: Number(main.distributorPrice || 0) || 0,
  };
}

export async function fetchPricingMatrix(force = false): Promise<PricingMatrix> {
  if (!force && memoryCache && Object.keys(memoryCache).length > 0) {
    return memoryCache;
  }
  if (!force && inflight) return inflight;

  inflight = (async () => {
    const local = readLocalMatrix();
    try {
      const res = await authFetch(apiUrl("services/pricing"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          memoryCache = data as PricingMatrix;
          writeLocalMatrix(memoryCache);
          return memoryCache;
        }
      }
    } catch (e) {
      console.error("Failed to fetch pricing matrix", e);
    }
    memoryCache = local;
    return memoryCache;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function getCachedPricingMatrix(): PricingMatrix {
  return memoryCache || readLocalMatrix();
}

/** Admin PDF Services payment row (`/pdf-service`). */
export type PdfPricingRow = {
  slNo?: number;
  serviceName: string;
  admin?: string | number;
  othersiteAdmin?: string | number;
  distributor?: string | number;
  retailer?: string | number;
  customer?: string | number;
};

function parsePdfMoney(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function pdfPriceForRole(row: PdfPricingRow | null | undefined, role: PricingRole): number {
  if (!row) return 0;
  if (role === "distributor") {
    return parsePdfMoney(row.distributor) || parsePdfMoney(row.retailer) || 0;
  }
  if (role === "admin") {
    return parsePdfMoney(row.admin) || parsePdfMoney(row.retailer) || 0;
  }
  if (role === "customer") {
    return parsePdfMoney(row.customer) || parsePdfMoney(row.retailer) || 0;
  }
  return parsePdfMoney(row.retailer) || 0;
}

export function findPdfPricingRow(
  rows: PdfPricingRow[],
  serviceName: string,
  serviceId?: string,
): PdfPricingRow | null {
  const sname = normalize(serviceName);
  const sid = normalize(serviceId || "");
  if (!rows.length) return null;

  if (sname) {
    const exact = rows.find((r) => normalize(r.serviceName) === sname);
    if (exact) return exact;
  }
  if (sid) {
    const byIdish = rows.find((r) => {
      const n = normalize(r.serviceName);
      return n === sid || n.includes(sid) || sid.includes(n);
    });
    if (byIdish) return byIdish;
  }
  if (sname) {
    const partial = rows.find((r) => {
      const n = normalize(r.serviceName);
      return n.includes(sname) || sname.includes(n);
    });
    if (partial) return partial;
  }
  return null;
}

export async function fetchPdfPricingRows(force = false): Promise<PdfPricingRow[]> {
  try {
    const res = await authFetch(
      `${apiUrl("services/pdf-pricing")}${force ? `?t=${Date.now()}` : ""}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row: PdfPricingRow) =>
        row && typeof row.serviceName === "string" && row.serviceName.trim() !== "",
    );
  } catch (e) {
    console.error("Failed to fetch PDF pricing", e);
    return [];
  }
}

/** Apply admin PDF payment matrix amounts onto catalog cards by role. */
export function applyPdfPricingToServices<T extends { id: string; name: string; amount: number }>(
  services: T[],
  rows: PdfPricingRow[],
  role: PricingRole,
): T[] {
  if (!rows.length) return services;
  return services.map((svc) => {
    const row = findPdfPricingRow(rows, svc.name, svc.id);
    const amount = pdfPriceForRole(row, role);
    if (amount > 0) return { ...svc, amount };
    return svc;
  });
}
