import { useState, useEffect, useCallback, SetStateAction, Dispatch } from "react";

export interface CategoryService {
  id: string;
  name: string;
  logoUrl?: string;
}

function getApiBase(): string {
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(
    /\/api$/,
    "",
  );
}

function localKey(categoryId: string) {
  return `eseva_category_${categoryId}_v1`;
}

function readLocal<T>(categoryId: string): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(localKey(categoryId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function writeLocal<T>(categoryId: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(localKey(categoryId), JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function useCategoryServices<T extends CategoryService>(
  categoryId: string,
  defaultServices: T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [servicesList, setServicesList] = useState<T[]>(defaultServices);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      const local = readLocal<T>(categoryId);
      if (isMounted && local) {
        setServicesList(local);
      }

      try {
        const res = await fetch(
          `${getApiBase()}/api/settings/category_${categoryId}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            // Prefer local edits on this device if present
            const preferred = readLocal<T>(categoryId) || (data as T[]);
            if (isMounted) {
              setServicesList(preferred);
            }
          }
        }
      } catch (error) {
        console.error(
          `Failed to fetch category services for ${categoryId}:`,
          error,
        );
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };
    fetchServices();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const setServicesListWithPersistence: Dispatch<SetStateAction<T[]>> =
    useCallback(
      (value) => {
        setServicesList((prevState) => {
          const newState =
            typeof value === "function"
              ? (value as (prevState: T[]) => T[])(prevState)
              : value;

          writeLocal(categoryId, newState);

          const saveToBackend = async () => {
            try {
              await fetch(
                `${getApiBase()}/api/settings/category_${categoryId}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newState),
                },
              );
            } catch (error) {
              console.error(
                `Failed to save category services for ${categoryId}:`,
                error,
              );
            }
          };

          if (isInitialized) {
            void saveToBackend();
          }

          return newState;
        });
      },
      [categoryId, isInitialized],
    );

  return [servicesList, setServicesListWithPersistence];
}
