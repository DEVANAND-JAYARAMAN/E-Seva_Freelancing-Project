import { ValidationRule } from "./types";

export const validateField = (
  name: string,
  value: string,
  rule: ValidationRule | undefined,
  allValues: Record<string, string>
): string | null => {
  if (!rule) return null;

  const trimmed = value?.trim() || "";

  // 1. Required Check
  if (rule.required && !trimmed) {
    return rule.requiredMessage || "This field is required";
  }

  // If not required and empty, skip remaining validations
  if (!trimmed) return null;

  // 2. Minimum Length
  if (rule.minLength && trimmed.length < rule.minLength) {
    return rule.minLengthMessage || `Must be at least ${rule.minLength} characters`;
  }

  // 3. Maximum Length
  if (rule.maxLength && trimmed.length > rule.maxLength) {
    return rule.maxLengthMessage || `Cannot exceed ${rule.maxLength} characters`;
  }

  // 4. Regular Expression Pattern Match
  if (rule.pattern) {
    const regex = new RegExp(rule.pattern);
    if (!regex.test(trimmed)) {
      return rule.patternMessage || "Invalid format";
    }
  }

  // 5. Custom Validation Function
  if (rule.custom) {
    return rule.custom(trimmed, allValues);
  }

  return null;
};

// Common Validator Patterns
export const PATTERNS = {
  EMAIL: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  PHONE: "^\\d{10}$",
  AADHAAR: "^\\d{12}$",
  PAN: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
  PINCODE: "^\\d{6}$",
  NUMERIC: "^\\d+$",
};
