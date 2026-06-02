import React, { useState } from "react";
import { Upload, FileText, Eye, EyeOff } from "lucide-react";
import { FieldOption } from "./types";

interface BaseFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

// 1. InputField (Text, Number, Email, Password, File)
interface InputFieldProps extends BaseFieldProps {
  type: "text" | "number" | "email" | "password" | "file";
  value: string;
  onChange: (val: string) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  disabled,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (type === "file") {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
          {label}
        </label>
        <div
          className={`relative flex items-center justify-between border rounded-xl px-4 py-2 bg-white dark:bg-[#0a0f18]/30 transition-all ${
            error ? "border-red-500" : "border-slate-250 dark:border-slate-800/80"
          }`}
        >
          <span className="text-xs text-slate-450 truncate flex items-center gap-1.5">
            {value ? <FileText size={14} className="text-[#005c3a] dark:text-emerald-400" /> : <Upload size={14} />}
            {value || "No file chosen"}
          </span>
          <label className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-350 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 select-none">
            Choose File
            <input
              type="file"
              disabled={disabled}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(file ? file.name : "");
              }}
            />
          </label>
        </div>
        {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
      </div>
    );
  }

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${isPassword ? "pr-10" : ""} px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
            error
              ? "border-red-500"
              : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
};

// 2. TextAreaField
interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  rows?: number;
  onChange: (val: string) => void;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  placeholder,
  value,
  error,
  rows = 3,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        rows={rows}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 resize-none ${
          error
            ? "border-red-500"
            : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
        }`}
      />
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
};

// 3. SelectField
interface SelectFieldProps extends BaseFieldProps {
  options: FieldOption[];
  value: string;
  onChange: (val: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  value,
  error,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
        {label}
      </label>
      <select
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
          error
            ? "border-red-500"
            : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
};

// 4. PhoneField
interface PhoneFieldProps extends BaseFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  name,
  placeholder = "Enter phone number",
  value,
  error,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">
          +91
        </span>
        <input
          type="tel"
          name={name}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").substring(0, 10))}
          className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
            error
              ? "border-red-500"
              : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
          }`}
        />
      </div>
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
};

// 5. CheckboxField
interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  error,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-slate-350 text-[#005c3a] focus:ring-[#005c3a] dark:bg-[#0a0f18]/30"
        />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </span>
      </label>
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
};

// 6. RadioField
interface RadioFieldProps extends BaseFieldProps {
  options: FieldOption[];
  value: string;
  onChange: (val: string) => void;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  label,
  name,
  options,
  value,
  error,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 border-slate-350 text-[#005c3a] focus:ring-[#005c3a] dark:bg-[#0a0f18]/30"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
};

// 7. SubmitButton
interface SubmitButtonProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  text,
  loading,
  disabled,
  onClick,
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
      ) : null}
      <span>{text}</span>
    </button>
  );
};
