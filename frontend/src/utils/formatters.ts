/**
 * Formatting utility functions for clean data presentation
 */

const IST_TZ = "Asia/Kolkata";

/**
 * Formats a number or string as Indian Rupees (INR)
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., ₹2,895.00)
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Formats any transaction timestamp as live IST date-time: YYYY-MM-DD HH:mm:ss
 */
export function formatTxnDateTime(input?: string | null): string {
  if (!input) return "—";
  const trimmed = String(input).trim();
  if (!trimmed) return "—";

  // Already in canonical IST display form from API
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const dateObj = new Date(trimmed);
  if (isNaN(dateObj.getTime())) {
    return trimmed;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(dateObj);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "00";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Current live IST date-time for optimistic UI rows */
export function nowTxnDateTime(): string {
  return formatTxnDateTime(new Date().toISOString());
}

/**
 * Formats a Date object or ISO string into a readable IST format
 * @param date - The date to format
 * @param includeTime - Whether to include hours, minutes, seconds
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, includeTime = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  if (includeTime) {
    return formatTxnDateTime(dateObj.toISOString());
  }

  return dateObj.toLocaleDateString("en-IN", {
    timeZone: IST_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats an Indian mobile number to standard +91-XXXXX-XXXXX or XXXXX XXXXX format
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const match = cleaned.match(/^(?:91)?(\d{5})(\d{5})$/);

  if (match) {
    return `+91 ${match[1]}-${match[2]}`;
  }

  return phoneNumber;
}

/**
 * Formats a file size in bytes into human-readable units (KB, MB, GB)
 * @param bytes - Size in bytes
 * @returns Formatted file size (e.g. 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
