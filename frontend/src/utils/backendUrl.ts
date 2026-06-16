const LAMBDA_URL = (process.env.NEXT_PUBLIC_LAMBDA_URL || "").replace(/\/+$/, "");

let cachedIP: string | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 min cache

export async function getBackendURL(): Promise<string> {
  if (cachedIP && Date.now() - cacheTime < CACHE_TTL) {
    return `http://${cachedIP}:8080`;
  }
  try {
    const res = await fetch(`${LAMBDA_URL}/ip`);
    const data = await res.json();
    if (data.public_ip) {
      cachedIP = data.public_ip;
      cacheTime = Date.now();
      return `http://${cachedIP}:8080`;
    }
  } catch {}
  // fallback to env
  return process.env.NEXT_PUBLIC_API_URL || "";
}
