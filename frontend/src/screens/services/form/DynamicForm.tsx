import React, { useState, useEffect } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { FormSchema } from "./types";
import { validateField } from "./validators";
import {
  InputField,
  TextAreaField,
  SelectField,
  PhoneField,
  CheckboxField,
  RadioField,
  SubmitButton,
} from "./FormFields";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";

interface DynamicFormProps {
  formId?: string;
  schema: FormSchema;
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = (props) => {
  return <DynamicFormInner {...props} />;
};

const DynamicFormInner: React.FC<DynamicFormProps> = ({
  formId,
  schema,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: schema.pricingServiceId || schema.id,
    serviceName: schema.title,
    pricingCategoryId: schema.pricingCategoryId || "",
    retailerCharge: schema.pricingFallback ?? 100,
    formData,
    files: selectedFiles,
    onDone: onCancel,
  });

  // Initialize form state when the schema changes
  useEffect(() => {
    const initialData: Record<string, string> = {};
    schema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        initialData[field.name] = field.defaultValue || "";
      });
    });
    setFormData(initialData);
    setSelectedFiles([]);
    setErrors({});
  }, [schema]);

  const handleFieldChange = (
    name: string,
    value: string | boolean,
    file?: File,
  ) => {
    const stringValue =
      typeof value === "boolean" ? (value ? "true" : "false") : value;

    if (file) {
      setSelectedFiles((prev) => [
        ...prev.filter((f) => f.name !== file.name),
        file,
      ]);
    }

    setFormData((prev: Record<string, string>) => {
      const updated = { ...prev, [name]: stringValue };

      // Perform validation instantly on change if an error was previously present
      if (errors[name]) {
        // Find field config to get its validation rules
        let fieldConfig = null;
        for (const section of schema.sections) {
          const found = section.fields.find((f) => f.name === name);
          if (found) {
            fieldConfig = found;
            break;
          }
        }

        const errorMsg = validateField(
          name,
          stringValue,
          fieldConfig?.validation,
          updated,
        );
        setErrors((prevErrors: Record<string, string>) => {
          const next = { ...prevErrors };
          if (errorMsg) {
            next[name] = errorMsg;
          } else {
            delete next[name];
          }
          return next;
        });
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    schema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const val = formData[field.name] || "";
        const errorMsg = validateField(
          field.name,
          val,
          field.validation,
          formData,
        );
        if (errorMsg) {
          newErrors[field.name] = errorMsg;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorKey)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (schema.pricingCategoryId) {
      startPayment();
    } else {
      onSubmit(formData);
    }
  };

  if (!isForm) return paymentView;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Form Header with Title, Subtitle, and Pill-less Payment Headers */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {schema.title}
          </h2>
          {schema.subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {schema.subtitle}
            </p>
          )}
        </div>
        {schema.pricingCategoryId ? (
          <ServicePaymentBadge
            pricingCategoryId={schema.pricingCategoryId}
            serviceId={schema.pricingServiceId || schema.id}
            serviceName={schema.title}
            fallback={schema.pricingFallback ?? 0}
          />
        ) : schema.paymentLabel ? (
          <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
            {schema.paymentLabel}
          </div>
        ) : null}
      </div>

      {/* Dynamic Form Sections */}
      {schema.sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="space-y-5">
          {/* Centered bold section headers inside form bodies are mandatory */}
          <div className="border-b border-slate-100 dark:border-slate-900/60 pb-2 text-center">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
              {section.title}
            </h3>
          </div>

          {/* Grid Layout for Section Fields */}
          <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {section.fields.map((field) => {
              const colSpanClass =
                field.colSpan === 2 ? "md:col-span-2" : "col-span-1";
              const error = errors[field.name];
              const value = formData[field.name] || "";

              return (
                <div key={field.name} className={colSpanClass}>
                  {(() => {
                    switch (field.type) {
                      case "textarea":
                        return (
                          <TextAreaField
                            name={field.name}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={value}
                            error={error}
                            disabled={isLoading}
                            onChange={(val) =>
                              handleFieldChange(field.name, val)
                            }
                          />
                        );
                      case "select":
                        return (
                          <SelectField
                            name={field.name}
                            label={field.label}
                            options={field.options || []}
                            value={value}
                            error={error}
                            disabled={isLoading}
                            onChange={(val) =>
                              handleFieldChange(field.name, val)
                            }
                          />
                        );
                      case "phone":
                        return (
                          <PhoneField
                            name={field.name}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={value}
                            error={error}
                            disabled={isLoading}
                            onChange={(val) =>
                              handleFieldChange(field.name, val)
                            }
                          />
                        );
                      case "checkbox":
                        return (
                          <CheckboxField
                            name={field.name}
                            label={field.label}
                            checked={value === "true"}
                            error={error}
                            disabled={isLoading}
                            onChange={(checked) =>
                              handleFieldChange(field.name, checked)
                            }
                          />
                        );
                      case "radio":
                        return (
                          <RadioField
                            name={field.name}
                            label={field.label}
                            options={field.options || []}
                            value={value}
                            error={error}
                            disabled={isLoading}
                            onChange={(val) =>
                              handleFieldChange(field.name, val)
                            }
                          />
                        );
                      case "text":
                      case "number":
                      case "email":
                      case "password":
                      case "file":
                        return (
                          <InputField
                            name={field.name}
                            label={field.label}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={value}
                            error={error}
                            disabled={isLoading}
                            onChange={(val, file) =>
                              handleFieldChange(field.name, val, file)
                            }
                          />
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Form Action Buttons */}
      
      {/* Added Extra Fields */}
      {overrides.addedFields && overrides.addedFields.length > 0 && (
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {overrides.addedFields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={(field.type as any) || "text"}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              error={errors && errors[field.name]}
              disabled={isLoading}
              onChange={(val, file) => {
                handleFieldChange(field.name, val as string, file);
              }}
            />
          ))}
        </div>
      )}
<div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton
          text={schema.submitButtonText || "Apply"}
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </form>
  );
};
