import { useState, useEffect, useCallback, SetStateAction, Dispatch } from "react";

export interface CategoryService {
  id: string;
  name: string;
}

export function useCategoryServices<T extends CategoryService>(
  categoryId: string,
  defaultServices: T[]
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [servicesList, setServicesList] = useState<T[]>(defaultServices);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
        const res = await fetch(`${apiUrl}/api/settings/category_${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          // If data is empty object, it means it hasn't been saved yet, so use defaults.
          if (data && Array.isArray(data) && data.length > 0) {
            if (isMounted) {
              setServicesList(data as T[]);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch category services for ${categoryId}:`, error);
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

  // Wrapper for setServicesList that also saves to backend
  const setServicesListWithPersistence: Dispatch<SetStateAction<T[]>> = useCallback(
    (value) => {
      setServicesList((prevState) => {
        const newState = typeof value === "function" ? (value as (prevState: T[]) => T[])(prevState) : value;

        // Fire and forget save to backend
        const saveToBackend = async () => {
          try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
            await fetch(`${apiUrl}/api/settings/category_${categoryId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newState),
            });
          } catch (error) {
            console.error(`Failed to save category services for ${categoryId}:`, error);
          }
        };

        // Only save if it's already initialized to avoid saving default state before fetch completes
        if (isInitialized) {
          saveToBackend();
        }

        return newState;
      });
    },
    [categoryId, isInitialized]
  );

  return [servicesList, setServicesListWithPersistence];
}
