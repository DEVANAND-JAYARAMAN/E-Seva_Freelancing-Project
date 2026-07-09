import React, { useState, useEffect } from "react";
import { Upload, FileText, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { FieldOption } from "./types";
import { useFormEdit } from "../../../store/context/FormEditContext";

// --- FIELD EDIT WRAPPER ---
interface FieldWrapperProps {
  name: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  disableEdit?: boolean;
  children: (
    resolvedLabel: string,
    resolvedPlaceholder?: string,
  ) => React.ReactNode;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  name,
  defaultLabel,
  defaultPlaceholder,
  disableEdit,
  children,
}) => {
  const { overrides, isEditMode, deleteField, editField } = useFormEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState("");
  const [tempPlaceholder, setTempPlaceholder] = useState("");

  const isDeleted = !disableEdit && overrides.deletedFields.includes(name);
  const label =
    (!disableEdit && overrides.fieldOverrides[name]?.label) || defaultLabel;
  const placeholder =
    (!disableEdit && overrides.fieldOverrides[name]?.placeholder) ||
    defaultPlaceholder;

  useEffect(() => {
    setTempLabel(label);
    setTempPlaceholder(placeholder || "");
  }, [label, placeholder]);

  if (isDeleted) return null;

  return (
    <div
      className={`flex flex-col gap-1.5 w-full transition-all ${
        isEditMode && !disableEdit
          ? "p-2.5 rounded-2xl border border-amber-400/50 dark:border-amber-500/30 bg-amber-500/[0.02] dark:bg-amber-500/[0.01]"
          : "p-0 border border-transparent"
      }`}
    >
      {isEditMode && !disableEdit && (
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-dashed border-amber-400/20">
          <span className="text-[9px] font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-widest select-none">
            Field: {name}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-350 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded-md transition-colors"
              title="Edit label/placeholder"
            >
              <Pencil size={11} />
            </button>
            <button
              type="button"
              onClick={() => deleteField(name)}
              className="p-1 text-red-500 hover:text-red-655 dark:text-red-400 dark:hover:text-red-350 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
              title="Delete field"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}

      {children(label, placeholder)}

      {isEditing && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 mt-2 animate-in slide-in-from-top-1 duration-150">
          <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-555 select-none">
            Edit Field Settings
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase">
              Label
            </label>
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="Field Label"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18]/50 text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c3a]"
            />
          </div>
          {defaultPlaceholder !== undefined && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase">
                Placeholder
              </label>
              <input
                type="text"
                value={tempPlaceholder}
                onChange={(e) => setTempPlaceholder(e.target.value)}
                placeholder="Field Placeholder"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18]/50 text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c3a]"
              />
            </div>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                editField(name, tempLabel, tempPlaceholder);
                setIsEditing(false);
              }}
              className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#005c3a] text-white hover:bg-[#004d30] rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface BaseFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  disableEdit?: boolean;
}

// 1. InputField (Text, Number, Email, Password, File, Date)
interface InputFieldProps extends BaseFieldProps {
  type: "text" | "number" | "email" | "password" | "file" | "date";
  value: string;
  onChange: (val: string, file?: File) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label: defaultLabel,
  name,
  type,
  placeholder: defaultPlaceholder,
  value,
  error,
  disabled,
  onChange,
  disableEdit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FieldWrapper
      name={name}
      defaultLabel={defaultLabel}
      defaultPlaceholder={defaultPlaceholder}
      disableEdit={disableEdit}
    >
      {(label, placeholder) => {
        if (type === "file") {
          return (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                {label}
              </label>
              <div
                className={`relative flex items-center justify-between border rounded-xl px-4 py-2 bg-slate-50 dark:bg-[#0a0f18]/30 transition-all ${
                  error
                    ? "border-red-500"
                    : "border-slate-250 dark:border-slate-800/80"
                }`}
              >
                <span className="text-xs text-slate-455 truncate flex items-center gap-1.5">
                  {value ? (
                    <FileText
                      size={14}
                      className="text-[#005c3a] dark:text-emerald-400"
                    />
                  ) : (
                    <Upload size={14} />
                  )}
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
                      onChange(file ? file.name : "", file);
                    }}
                  />
                </label>
              </div>
              {error && (
                <span className="text-[10px] font-bold text-red-500">
                  {error}
                </span>
              )}
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              {label}
            </label>
            <div className="relative w-full">
              <input
                type={
                  type === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : type
                }
                name={name}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full ${type === "password" ? "pl-4 pr-11" : "px-4"} py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-slate-50 dark:bg-[#0a0f18]/30 ${
                  error
                    ? "border-red-500"
                    : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={16} className="stroke-[2]" />
                  ) : (
                    <Eye size={16} className="stroke-[2]" />
                  )}
                </button>
              )}
            </div>
            {error && (
              <span className="text-[10px] font-bold text-red-500">
                {error}
              </span>
            )}
          </div>
        );
      }}
    </FieldWrapper>
  );
};

// 2. TextAreaField
interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  rows?: number;
  onChange: (val: string, file?: File) => void;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label: defaultLabel,
  name,
  placeholder: defaultPlaceholder,
  value,
  error,
  rows = 3,
  disabled,
  onChange,
  disableEdit,
}) => {
  return (
    <FieldWrapper
      name={name}
      defaultLabel={defaultLabel}
      defaultPlaceholder={defaultPlaceholder}
      disableEdit={disableEdit}
    >
      {(label, placeholder) => (
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
            {label}
          </label>
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            rows={rows}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-slate-50 dark:bg-[#0a0f18]/30 resize-none ${
              error
                ? "border-red-500"
                : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
            }`}
          />
          {error && (
            <span className="text-[10px] font-bold text-red-500">{error}</span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
};

// 3. SelectField
interface SelectFieldProps extends BaseFieldProps {
  options: FieldOption[];
  value: string;
  onChange: (val: string, file?: File) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label: defaultLabel,
  name,
  options,
  value,
  error,
  disabled,
  onChange,
  disableEdit,
}) => {
  return (
    <FieldWrapper
      name={name}
      defaultLabel={defaultLabel}
      disableEdit={disableEdit}
    >
      {(label) => (
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
            {label}
          </label>
          <select
            name={name}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-slate-50 dark:bg-[#0a0f18]/30 ${
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
          {error && (
            <span className="text-[10px] font-bold text-red-500">{error}</span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
};

// 4. PhoneField
interface PhoneFieldProps extends BaseFieldProps {
  value: string;
  onChange: (val: string, file?: File) => void;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label: defaultLabel,
  name,
  placeholder: defaultPlaceholder = "Enter phone number",
  value,
  error,
  disabled,
  onChange,
  disableEdit,
}) => {
  return (
    <FieldWrapper
      name={name}
      defaultLabel={defaultLabel}
      defaultPlaceholder={defaultPlaceholder}
      disableEdit={disableEdit}
    >
      {(label, placeholder) => (
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
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
              onChange={(e) =>
                onChange(e.target.value.replace(/\D/g, "").substring(0, 10))
              }
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-slate-50 dark:bg-[#0a0f18]/30 ${
                error
                  ? "border-red-500"
                  : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
              }`}
            />
          </div>
          {error && (
            <span className="text-[10px] font-bold text-red-500">{error}</span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
};

// 5. CheckboxField
interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (val: boolean, file?: File) => void;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label: defaultLabel,
  name,
  checked,
  error,
  disabled,
  onChange,
  disableEdit,
}) => {
  return (
    <FieldWrapper
      name={name}
      defaultLabel={defaultLabel}
      disableEdit={disableEdit}
    >
      {(label) => (
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
          {error && (
            <span className="text-[10px] font-bold text-red-500">{error}</span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
};

// 6. RadioField
interface RadioFieldProps extends BaseFieldProps {
  options: FieldOption[];
  value: string;
  onChange: (val: string, file?: File) => void;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  label: defaultLabel,
  name,
  options,
  value,
  error,
  disabled,
  onChange,
}) => {
  return (
    <FieldWrapper name={name} defaultLabel={defaultLabel}>
      {(label) => (
        <div className="flex flex-col gap-2 w-full">
          <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
            {label}
          </label>
          <div className="flex flex-wrap gap-4">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="inline-flex items-center gap-2 cursor-pointer select-none"
              >
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
          {error && (
            <span className="text-[10px] font-bold text-red-500">{error}</span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
};

// 7. SubmitButton (With Edit toggle button aligned on the far left side)
interface SubmitButtonProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  hideEditButton?: boolean;
  onClick?: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  text,
  loading,
  disabled,
  hideEditButton,
  onClick,
}) => {
  const { isAdmin, isEditMode, setIsEditMode, resetFormConfig, addField } =
    useFormEdit();

  const handleAddFieldClick = () => {
    import("sweetalert2").then((Swal) => {
      Swal.default
        .fire({
          title: "Add Extra Form Field",
          html: `
          <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; padding: 10px;">
            <div>
              <label style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b;">Field Label</label>
              <input id="swal-field-label" class="swal2-input" placeholder="e.g. Father's Name" style="margin: 5px 0 0 0; width: 100%; height: 38px; font-size: 14px; border-radius: 10px; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b;">Placeholder</label>
              <input id="swal-field-placeholder" class="swal2-input" placeholder="e.g. Enter father's name" style="margin: 5px 0 0 0; width: 100%; height: 38px; font-size: 14px; border-radius: 10px; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b;">Field Type</label>
              <select id="swal-field-type" class="swal2-select" style="margin: 5px 0 0 0; width: 100%; height: 38px; font-size: 14px; border-radius: 10px; border: 1px solid #d9d9d9; box-sizing: border-box;">
                <option value="text">Text Input</option>
                <option value="number">Number Input</option>
                <option value="phone">Phone Input</option>
                <option value="textarea">Textarea (Multi-line)</option>
                <option value="file">File Upload</option>
              </select>
            </div>
          </div>
        `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Add Field",
          confirmButtonColor: "#005c3a",
          cancelButtonColor: "#6c757d",
          preConfirm: () => {
            const label = (
              document.getElementById("swal-field-label") as HTMLInputElement
            ).value;
            const placeholder = (
              document.getElementById(
                "swal-field-placeholder",
              ) as HTMLInputElement
            ).value;
            const type = (
              document.getElementById("swal-field-type") as HTMLSelectElement
            ).value;
            if (!label.trim()) {
              Swal.default.showValidationMessage("Field label is required");
              return false;
            }
            return { label, placeholder, type };
          },
        })
        .then((result) => {
          if (result.isConfirmed && result.value) {
            addField(
              result.value.label,
              result.value.placeholder,
              result.value.type,
            );
            Swal.default.fire({
              title: "Field Added",
              text: `Field "${result.value.label}" was added successfully!`,
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        });
    });
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!isEditMode) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      const btn = target.closest("button");
      const span = target.closest("span");

      // Skip if clicking edit/save/add buttons inside the form edit fields
      if (
        btn?.textContent?.includes("Save Editing") ||
        btn?.textContent?.includes("Edit Form Fields") ||
        btn?.textContent?.includes("Add Field")
      ) {
        return;
      }
      if (target.closest(".bg-slate-50.dark\\:bg-slate-900\\/60.p-3")) {
        // Skip clicking save/cancel inside field edit settings popup
        return;
      }

      const clickedText = target.textContent || "";
      const parentBtnText = btn?.textContent || "";
      const parentSpanText = span?.textContent || "";

      const isNavClick =
        anchor !== null ||
        clickedText.includes("Back") ||
        parentBtnText.includes("Back") ||
        clickedText.includes("Services Directory") ||
        parentSpanText.includes("Services Directory") ||
        clickedText.includes("Cancel") ||
        parentBtnText.includes("Cancel");

      if (isNavClick) {
        e.preventDefault();
        e.stopPropagation();

        import("sweetalert2").then((Swal) => {
          Swal.default
            .fire({
              title: "Save Changes?",
              text: "Do you want to save your form edits or discard them?",
              icon: "warning",
              showDenyButton: true,
              showCancelButton: true,
              confirmButtonText: "Save Changes",
              denyButtonText: "Discard Changes",
              cancelButtonText: "Keep Editing",
              confirmButtonColor: "#005c3a",
              denyButtonColor: "#d33",
              cancelButtonColor: "#6c757d",
            })
            .then((result) => {
              if (result.isConfirmed) {
                // Save changes and proceed
                setIsEditMode(false);
                setTimeout(() => {
                  const clickable = btn || anchor || target;
                  clickable.click();
                }, 100);
              } else if (result.isDenied) {
                // Discard changes, reset form layout config, and proceed
                resetFormConfig();
                setIsEditMode(false);
                setTimeout(() => {
                  const clickable = btn || anchor || target;
                  clickable.click();
                }, 100);
              }
            });
        });
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, {
        capture: true,
      });
    };
  }, [isEditMode, setIsEditMode, resetFormConfig]);

  return (
    <React.Fragment>
      {isAdmin && !hideEditButton && (
        <div className="flex gap-2" style={{ order: -1, marginRight: "auto" }}>
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all duration-200 border border-transparent select-none ${
              isEditMode
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white"
            }`}
          >
            {isEditMode ? "Save Editing" : "Edit Form Fields"}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={handleAddFieldClick}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all duration-200 border border-transparent select-none"
            >
              Add Field
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || loading}
        onClick={onClick}
        className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
        ) : null}
        <span>{text}</span>
      </button>
    </React.Fragment>
  );
};
