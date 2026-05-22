/**
 * Formatting utility functions for clean data presentation
 */

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
 * Formats a Date object or ISO string into a readable format
 * @param date - The date to format
 * @param includeTime - Whether to include hours, minutes, seconds
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, includeTime = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  if (includeTime) {
    return dateObj.toLocaleString("en-IN", {
      ...dateOptions,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return dateObj.toLocaleDateString("en-IN", dateOptions);
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
 * @returns Formatted file size string (e.g. 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
