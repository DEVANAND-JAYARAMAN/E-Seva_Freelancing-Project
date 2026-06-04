export type FieldType = "text" | "number" | "email" | "password" | "textarea" | "select" | "phone" | "checkbox" | "radio" | "file";

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  required?: boolean;
  requiredMessage?: string;
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  custom?: (value: string, allValues: Record<string, string>) => string | null;
}

export interface FieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  options?: FieldOption[]; // For select, radio
  validation?: ValidationRule;
  colSpan?: 1 | 2; // For responsive layout grids
  defaultValue?: string;
}

export interface FormSection {
  title: string;
  fields: FieldConfig[];
}

export interface FormSchema {
  id: string;
  title: string;
  subtitle?: string;
  paymentLabel?: string;
  sections: FormSection[];
  submitButtonText?: string;
}
