"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

export interface FieldOverride {
  label?: string;
  placeholder?: string;
}

export interface AddedField {
  name: string;
  label: string;
  placeholder?: string;
  type: string;
}

export interface FormOverrides {
  deletedFields: string[];
  fieldOverrides: Record<string, FieldOverride>;
  addedFields?: AddedField[];
  title?: string;
  subtitle?: string;
}

interface FormEditContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  isAdmin: boolean;
  overrides: FormOverrides;
  formScope: string | null;
  setFormScope: (scope: string | null) => void;
  deleteField: (fieldName: string) => void;
  restoreField: (fieldName: string) => void;
  editField: (fieldName: string, label: string, placeholder: string) => void;
  editFormHeader: (title: string, subtitle: string) => Promise<boolean>;
  resetFormConfig: () => void;
  addField: (label: string, placeholder: string, type: string) => void;
}

const FormEditContext = createContext<FormEditContextType | undefined>(
  undefined,
);

const EMPTY_OVERRIDES: FormOverrides = {
  deletedFields: [],
  fieldOverrides: {},
  addedFields: [],
};

const LOCAL_STORAGE_KEY = "eseva_form_overrides_v1";

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function normalizeOverridesMap(
  data: Record<string, FormOverrides> | null | undefined,
): Record<string, FormOverrides> {
  const out: Record<string, FormOverrides> = {};
  if (!data || typeof data !== "object") return out;

  for (const [rawKey, value] of Object.entries(data)) {
    if (!value || typeof value !== "object") continue;
    const parts = rawKey.split("::");
    const path = normalizePath(parts[0] || "/");
    const key = parts.length > 1 ? `${path}::${parts.slice(1).join("::")}` : path;

    const existing = out[key];
    if (!existing) {
      out[key] = {
        deletedFields: value.deletedFields || [],
        fieldOverrides: value.fieldOverrides || {},
        addedFields: value.addedFields || [],
        title: value.title,
        subtitle: value.subtitle,
      };
      continue;
    }

    out[key] = {
      deletedFields: Array.from(
        new Set([
          ...(existing.deletedFields || []),
          ...(value.deletedFields || []),
        ]),
      ),
      fieldOverrides: {
        ...(existing.fieldOverrides || {}),
        ...(value.fieldOverrides || {}),
      },
      addedFields: [
        ...(existing.addedFields || []),
        ...(value.addedFields || []),
      ],
      title: value.title ?? existing.title,
      subtitle: value.subtitle ?? existing.subtitle,
    };
  }
  return out;
}

function getApiBase(): string {
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(
    /\/api$/,
    "",
  );
}

function readLocalOverrides(): Record<string, FormOverrides> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return normalizeOverridesMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeLocalOverrides(data: Record<string, FormOverrides>): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export const FormEditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formScope, setFormScope] = useState<string | null>(null);
  const [allOverrides, setAllOverrides] = useState<
    Record<string, FormOverrides>
  >({});
  const [prevPath, setPrevPath] = useState(pathname);

  const allOverridesRef = useRef(allOverrides);
  allOverridesRef.current = allOverrides;

  const isAdmin = user?.role === "admin";

  const baseFormId = normalizePath(pathname || "default");
  const formId = formScope ? `${baseFormId}::${formScope}` : baseFormId;

  useEffect(() => {
    if (pathname !== prevPath) {
      if (isEditMode) {
        setIsEditMode(false);
        import("sweetalert2").then((Swal) => {
          Swal.default.fire({
            title: "Save Editing",
            text: "Edit mode has been turned off.",
            icon: "info",
            confirmButtonColor: "#005c3a",
          });
        });
      }
      setPrevPath(pathname);
    }
  }, [pathname, prevPath, isEditMode]);

  useEffect(() => {
    let isMounted = true;
    const fetchOverrides = async () => {
      const local = readLocalOverrides();
      if (isMounted && Object.keys(local).length > 0) {
        setAllOverrides((prev) => ({ ...local, ...prev }));
      }

      try {
        const res = await fetch(`${getApiBase()}/api/settings/form_overrides`);
        if (res.ok) {
          const data = await res.json();
          const remote = normalizeOverridesMap(data);
          if (isMounted) {
            // Local edits win over remote (so refresh keeps rename on localhost)
            const merged = { ...remote, ...readLocalOverrides() };
            setAllOverrides(merged);
            allOverridesRef.current = merged;
          }
        }
      } catch (e) {
        console.error("Failed to load form overrides from backend:", e);
      }
    };
    fetchOverrides();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistOverrides = useCallback(
    async (updated: Record<string, FormOverrides>) => {
      let remote: Record<string, FormOverrides> = {};
      try {
        const getRes = await fetch(
          `${getApiBase()}/api/settings/form_overrides`,
        );
        if (getRes.ok) {
          remote = normalizeOverridesMap(await getRes.json());
        }
      } catch {
        // ignore — fall back to local merge
      }

      const merged = normalizeOverridesMap({
        ...remote,
        ...allOverridesRef.current,
        ...updated,
      });

      setAllOverrides(merged);
      allOverridesRef.current = merged;

      const localOk = writeLocalOverrides(merged);

      let apiOk = false;
      try {
        const res = await fetch(`${getApiBase()}/api/settings/form_overrides`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });
        apiOk = res.ok;
        if (!res.ok) {
          console.error(
            "Form overrides API save failed:",
            res.status,
            await res.text().catch(() => ""),
          );
        }
      } catch (e) {
        console.error("Failed to save form overrides to backend:", e);
      }

      // Success if API saved OR localStorage saved (localhost CORS workaround)
      if (apiOk || localOk) return true;
      return false;
    },
    [],
  );

  const getFormConfig = useCallback((id: string): FormOverrides => {
    const map = allOverridesRef.current;
    const scoped = map[id];
    if (scoped) return { ...EMPTY_OVERRIDES, ...scoped };

    if (id.includes("::")) {
      const base = id.split("::")[0];
      if (map[base]) return { ...EMPTY_OVERRIDES, ...map[base] };
    }
    return { ...EMPTY_OVERRIDES };
  }, []);

  const currentOverrides: FormOverrides = allOverrides[formId]
    ? { ...EMPTY_OVERRIDES, ...allOverrides[formId] }
    : formScope && allOverrides[baseFormId]
      ? { ...EMPTY_OVERRIDES, ...allOverrides[baseFormId] }
      : { ...EMPTY_OVERRIDES };

  const deleteField = (fieldName: string) => {
    const formConfig = { ...getFormConfig(formId) };
    if (fieldName.startsWith("custom_")) {
      formConfig.addedFields = (formConfig.addedFields || []).filter(
        (f) => f.name !== fieldName,
      );
    } else if (!formConfig.deletedFields.includes(fieldName)) {
      formConfig.deletedFields = [...formConfig.deletedFields, fieldName];
    }
    void persistOverrides({
      ...allOverridesRef.current,
      [formId]: formConfig,
    });
  };

  const restoreField = (fieldName: string) => {
    const formConfig = { ...getFormConfig(formId) };
    formConfig.deletedFields = formConfig.deletedFields.filter(
      (name) => name !== fieldName,
    );
    void persistOverrides({
      ...allOverridesRef.current,
      [formId]: formConfig,
    });
  };

  const editField = (fieldName: string, label: string, placeholder: string) => {
    const formConfig = { ...getFormConfig(formId) };
    if (fieldName.startsWith("custom_")) {
      formConfig.addedFields = (formConfig.addedFields || []).map((f) =>
        f.name === fieldName ? { ...f, label, placeholder } : f,
      );
    } else {
      formConfig.fieldOverrides = {
        ...formConfig.fieldOverrides,
        [fieldName]: { label, placeholder },
      };
    }
    void persistOverrides({
      ...allOverridesRef.current,
      [formId]: formConfig,
    });
  };

  const addField = (label: string, placeholder: string, type: string) => {
    const formConfig = { ...getFormConfig(formId) };
    const name = `custom_${type}_${Date.now()}`;
    formConfig.addedFields = [
      ...(formConfig.addedFields || []),
      { name, label, placeholder, type },
    ];
    void persistOverrides({
      ...allOverridesRef.current,
      [formId]: formConfig,
    });
  };

  const editFormHeader = async (title: string, subtitle: string) => {
    const formConfig = { ...getFormConfig(formId) };
    formConfig.title = title;
    formConfig.subtitle = subtitle;
    const ok = await persistOverrides({
      ...allOverridesRef.current,
      [formId]: formConfig,
    });
    if (!ok) {
      import("sweetalert2").then((Swal) => {
        Swal.default.fire({
          title: "Save failed",
          text: "Could not save rename. Please try again.",
          icon: "error",
          confirmButtonColor: "#005c3a",
        });
      });
    }
    return ok;
  };

  const resetFormConfig = () => {
    const updated = { ...allOverridesRef.current };
    delete updated[formId];
    void persistOverrides(updated);
  };

  useEffect(() => {
    if (!isAdmin) {
      setIsEditMode(false);
    }
  }, [isAdmin]);

  return (
    <FormEditContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        isAdmin,
        overrides: currentOverrides,
        formScope,
        setFormScope,
        deleteField,
        restoreField,
        editField,
        editFormHeader,
        resetFormConfig,
        addField,
      }}
    >
      {children}
    </FormEditContext.Provider>
  );
};

export const useFormEdit = () => {
  const context = useContext(FormEditContext);
  if (!context) {
    throw new Error("useFormEdit must be used within a FormEditProvider");
  }
  return context;
};
