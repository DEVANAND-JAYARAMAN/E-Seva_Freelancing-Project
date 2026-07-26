"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../store/context/AuthContext";
import {
  categoryCardPrices,
  fetchPricingMatrix,
  getCachedPricingMatrix,
  resolveServiceCharge,
  type PricingMatrix,
  type PricingRole,
} from "../utils/servicePricing";

export function useServicePricing() {
  const { user } = useAuth();
  const role = (user?.role || "retailer") as PricingRole;
  const [matrix, setMatrix] = useState<PricingMatrix>(() => getCachedPricingMatrix());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPricingMatrix()
      .then((data) => {
        if (alive) setMatrix(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const getCharge = useCallback(
    (opts: {
      categoryId?: string;
      serviceId?: string;
      serviceName?: string;
      fallback?: number;
    }) =>
      resolveServiceCharge(matrix, {
        ...opts,
        role,
      }),
    [matrix, role],
  );

  const getCategoryPrices = useCallback(
    (categoryId: string) => categoryCardPrices(matrix, categoryId),
    [matrix],
  );

  return { matrix, loading, role, getCharge, getCategoryPrices, refresh: () => fetchPricingMatrix(true).then(setMatrix) };
}
