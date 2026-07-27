export const API_BASE_URL = "https://apizone.info/api/";

export type ApiDocSection =
  | "overview"
  | "authentication"
  | "balance"
  | "aadhaar-to-pan"
  | "pan-details"
  | "rc-print"
  | "dl-print"
  | "ration-print";

export type ApiDocNavItem = {
  id: ApiDocSection;
  label: string;
  group: "INTRODUCTION" | "ENDPOINTS";
};

export const apiDocNav: ApiDocNavItem[] = [
  { id: "overview", label: "Overview", group: "INTRODUCTION" },
  { id: "authentication", label: "Authentication", group: "INTRODUCTION" },
  { id: "balance", label: "Balance Check", group: "ENDPOINTS" },
  { id: "aadhaar-to-pan", label: "Aadhaar to PAN", group: "ENDPOINTS" },
  { id: "pan-details", label: "PAN Details", group: "ENDPOINTS" },
  { id: "rc-print", label: "RC Print", group: "ENDPOINTS" },
  { id: "dl-print", label: "DL Print", group: "ENDPOINTS" },
  { id: "ration-print", label: "Ration Print", group: "ENDPOINTS" },
];

export type ApiEndpointDoc = {
  id: ApiDocSection;
  title: string;
  summary: string;
  method?: "GET" | "POST";
  path?: string;
  requestExample?: string;
  responseExample?: string;
  notes?: string[];
};

export const apiDocs: Record<ApiDocSection, ApiEndpointDoc> = {
  overview: {
    id: "overview",
    title: "Thuruvan Developer Docs",
    summary:
      "REST APIs for partner integrations. Use your API key, debit from Api Wallet, and call endpoints from any language.",
    notes: [
      "99.9% target uptime",
      "JSON request / response",
      "Api Wallet balance required for paid endpoints",
    ],
  },
  authentication: {
    id: "authentication",
    title: "Authentication",
    summary:
      "Send your API key in the request header. Generate or rotate the key from Developers → API Key.",
    requestExample: `curl -X POST "${API_BASE_URL}balance" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{}'`,
    notes: [
      "Header: x-api-key: <your_key>",
      "Optional IP whitelist (max 5 IPs) on API Key page",
      "Never expose the key in public frontend code",
    ],
  },
  balance: {
    id: "balance",
    title: "Balance Check",
    summary: "Fetch current Api Wallet balance for the authenticated partner.",
    method: "POST",
    path: "balance",
    requestExample: `{
  "api_key": "YOUR_API_KEY"
}`,
    responseExample: `{
  "status": "success",
  "balance": 2.03
}`,
  },
  "aadhaar-to-pan": {
    id: "aadhaar-to-pan",
    title: "Aadhaar to PAN",
    summary: "Lookup PAN linked to an Aadhaar number.",
    method: "POST",
    path: "aadhaar-to-pan",
    requestExample: `{
  "aadhaar": "XXXXXXXXXXXX"
}`,
    responseExample: `{
  "status": "success",
  "pan": "ABCDE1234F"
}`,
  },
  "pan-details": {
    id: "pan-details",
    title: "PAN Details",
    summary: "Fetch PAN holder details.",
    method: "POST",
    path: "pan-details",
    requestExample: `{
  "pan": "ABCDE1234F"
}`,
    responseExample: `{
  "status": "success",
  "name": "SAMPLE NAME",
  "pan": "ABCDE1234F"
}`,
  },
  "rc-print": {
    id: "rc-print",
    title: "RC Print",
    summary: "Vehicle RC details / print payload.",
    method: "POST",
    path: "rc-print",
    requestExample: `{
  "vehicle_no": "TN01AB1234"
}`,
  },
  "dl-print": {
    id: "dl-print",
    title: "DL Print",
    summary: "Driving licence details / print payload.",
    method: "POST",
    path: "dl-print",
    requestExample: `{
  "dl_no": "TN0120110001234"
}`,
  },
  "ration-print": {
    id: "ration-print",
    title: "Ration Print",
    summary: "Ration card details / print payload.",
    method: "POST",
    path: "ration-print",
    requestExample: `{
  "ration_no": "XXXXXXXX"
}`,
  },
};
