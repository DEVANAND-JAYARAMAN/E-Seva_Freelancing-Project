"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
}

interface FormEditContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  isAdmin: boolean;
  overrides: FormOverrides;
  deleteField: (fieldName: string) => void;
  restoreField: (fieldName: string) => void;
  editField: (fieldName: string, label: string, placeholder: string) => void;
  resetFormConfig: () => void;
  addField: (label: string, placeholder: string, type: string) => void;
}

const FormEditContext = createContext<FormEditContextType | undefined>(
  undefined,
);

export const FormEditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isEditMode, setIsEditMode] = useState(false);
  const [allOverrides, setAllOverrides] = useState<
    Record<string, FormOverrides>
  >({});
  const [prevPath, setPrevPath] = useState(pathname);

  const isAdmin = user?.role === "admin";

  // Use pathname as the unique identifier for the current form/page
  const formId = pathname || "default";

  // Turn off edit mode and show SweetAlert on route navigation
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

  // Load overrides from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("form_overrides");
      if (stored) {
        setAllOverrides(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load form overrides:", e);
    }
  }, []);

  // Save overrides helper
  const saveOverrides = (updated: Record<string, FormOverrides>) => {
    setAllOverrides(updated);
    try {
      localStorage.setItem("form_overrides", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save form overrides:", e);
    }
  };

  // Get current form overrides or fallback to empty structure
  const currentOverrides: FormOverrides = allOverrides[formId] || {
    deletedFields: [],
    fieldOverrides: {},
    addedFields: [],
  };

  const deleteField = (fieldName: string) => {
    const formConfig = { ...currentOverrides };
    if (fieldName.startsWith("custom_")) {
      if (formConfig.addedFields) {
        formConfig.addedFields = formConfig.addedFields.filter(
          (f) => f.name !== fieldName,
        );
        saveOverrides({
          ...allOverrides,
          [formId]: formConfig,
        });
      }
    } else {
      if (!formConfig.deletedFields.includes(fieldName)) {
        formConfig.deletedFields = [...formConfig.deletedFields, fieldName];
        saveOverrides({
          ...allOverrides,
          [formId]: formConfig,
        });
      }
    }
  };

  const restoreField = (fieldName: string) => {
    const formConfig = { ...currentOverrides };
    formConfig.deletedFields = formConfig.deletedFields.filter(
      (name) => name !== fieldName,
    );
    saveOverrides({
      ...allOverrides,
      [formId]: formConfig,
    });
  };

  const editField = (fieldName: string, label: string, placeholder: string) => {
    const formConfig = { ...currentOverrides };
    if (fieldName.startsWith("custom_")) {
      if (formConfig.addedFields) {
        formConfig.addedFields = formConfig.addedFields.map((f) =>
          f.name === fieldName ? { ...f, label, placeholder } : f,
        );
        saveOverrides({
          ...allOverrides,
          [formId]: formConfig,
        });
      }
    } else {
      formConfig.fieldOverrides = {
        ...formConfig.fieldOverrides,
        [fieldName]: { label, placeholder },
      };
      saveOverrides({
        ...allOverrides,
        [formId]: formConfig,
      });
    }
  };

  const addField = (label: string, placeholder: string, type: string) => {
    const formConfig = { ...currentOverrides };
    if (!formConfig.addedFields) {
      formConfig.addedFields = [];
    }
    const name = `custom_${type}_${Date.now()}`;
    formConfig.addedFields = [
      ...formConfig.addedFields,
      { name, label, placeholder, type },
    ];
    saveOverrides({
      ...allOverrides,
      [formId]: formConfig,
    });
  };

  const resetFormConfig = () => {
    const updated = { ...allOverrides };
    delete updated[formId];
    saveOverrides(updated);
  };

  // Automatically turn off edit mode if user changes or log out
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
        deleteField,
        restoreField,
        editField,
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
