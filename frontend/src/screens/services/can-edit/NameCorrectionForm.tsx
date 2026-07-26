import React, { useMemo, useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField } from "../form/FormFields";

interface NameCorrectionFormProps {
  onCancel: () => void;
}

type FieldDef = { name: string; label: string; placeholder: string };

const BUILTIN: FieldDef[] = [
  {
    name: "canNumber",
    label: "Can Number",
    placeholder: "Enter Can Number",
  },
  {
    name: "newNameEnglish",
    label: "New Name English",
    placeholder: "Enter new name in English",
  },
  {
    name: "newNameTamil",
    label: "New Name Tamil",
    placeholder: "புதிய பெயர் தமிழில்",
  },
];

function labelKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Map admin-added custom_* fields onto standard name-correction keys by label. */
function resolvePayload(
  formData: Record<string, string>,
  addedFields: { name: string; label: string }[],
): Record<string, string> {
  const out: Record<string, string> = { ...formData };

  const pick = (predicates: string[]) => {
    for (const f of addedFields) {
      const k = labelKey(f.label);
      if (predicates.some((p) => k.includes(p)) && formData[f.name]?.trim()) {
        return formData[f.name].trim();
      }
    }
    return "";
  };

  if (!out.canNumber?.trim()) {
    out.canNumber = pick(["cannumber", "can"]);
  }
  if (!out.newNameEnglish?.trim()) {
    out.newNameEnglish = pick(["newnameenglish", "nameenglish", "english"]);
  }
  if (!out.newNameTamil?.trim()) {
    out.newNameTamil = pick(["newnametamil", "nametamil", "tamil"]);
  }

  return out;
}

export const NameCorrectionForm: React.FC<NameCorrectionFormProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const deleted = new Set(overrides.deletedFields || []);
  const addedFields = overrides.addedFields || [];

  // If admin already added CAN/Name fields, prefer those and hide duplicate builtins
  const hasCustomCan = addedFields.some((f) =>
    labelKey(f.label).includes("can"),
  );
  const hasCustomEn = addedFields.some((f) => {
    const k = labelKey(f.label);
    return k.includes("english") || k === "newnameenglish";
  });
  const hasCustomTa = addedFields.some((f) => {
    const k = labelKey(f.label);
    return k.includes("tamil") || k === "newnametamil";
  });

  const visibleBuiltin = useMemo(
    () =>
      BUILTIN.filter((f) => {
        if (deleted.has(f.name)) return false;
        if (f.name === "canNumber" && hasCustomCan) return false;
        if (f.name === "newNameEnglish" && hasCustomEn) return false;
        if (f.name === "newNameTamil" && hasCustomTa) return false;
        return true;
      }),
    [deleted, hasCustomCan, hasCustomEn, hasCustomTa],
  );

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const payload = resolvePayload(formData, addedFields);

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "name-correction",
    serviceName: "Name Correction",
    pricingCategoryId: "can-edit",
    retailerCharge: 50,
    formData: payload,
    onDone: onCancel,
  });

  const handleFieldChange = (name: string, value: string) => {
    setSubmitError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const data = resolvePayload(formData, addedFields);
    const newErrors: Record<string, string> = {};

    const checks: { key: keyof typeof data; label: string; names: string[] }[] =
      [
        {
          key: "canNumber",
          label: "Can Number",
          names: [
            "canNumber",
            ...addedFields
              .filter((f) => labelKey(f.label).includes("can"))
              .map((f) => f.name),
          ],
        },
        {
          key: "newNameEnglish",
          label: "New Name English",
          names: [
            "newNameEnglish",
            ...addedFields
              .filter((f) => {
                const k = labelKey(f.label);
                return k.includes("english");
              })
              .map((f) => f.name),
          ],
        },
        {
          key: "newNameTamil",
          label: "New Name Tamil",
          names: [
            "newNameTamil",
            ...addedFields
              .filter((f) => labelKey(f.label).includes("tamil"))
              .map((f) => f.name),
          ],
        },
      ];

    for (const c of checks) {
      if (!String(data[c.key] || "").trim()) {
        // Attach error to first visible field name
        const target =
          c.names.find((n) =>
            visibleBuiltin.some((b) => b.name === n) ||
            addedFields.some((f) => f.name === n),
          ) || c.names[0];
        newErrors[target] = `${c.label} is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("Please fill all required fields, then click Apply.");
      return;
    }

    startPayment();
  };

  if (!isForm) return paymentView;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Name Correction
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
            Submit required details to apply for Name Correction services
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="can-edit"
          serviceId="name-correction"
          serviceName="Name Correction"
          fallback={50}
        />
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleBuiltin.map((f) => (
            <InputField
              key={f.name}
              name={f.name}
              label={f.label}
              type="text"
              placeholder={f.placeholder}
              value={formData[f.name] || ""}
              error={errors[f.name]}
              onChange={(val) => handleFieldChange(f.name, val)}
            />
          ))}

          {addedFields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={
                (field.type as "text" | "number" | "email" | "date" | "file") ||
                "text"
              }
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              error={errors[field.name]}
              onChange={(val) => handleFieldChange(field.name, val)}
            />
          ))}
        </div>
      </div>

      {submitError ? (
        <p className="text-sm font-semibold text-rose-600">{submitError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#005c3a] hover:bg-[#004d30] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98]"
        >
          Apply
        </button>
      </div>
    </form>
  );
};
