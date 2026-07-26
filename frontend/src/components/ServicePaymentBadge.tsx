"use client";

import { useServicePricing } from "../hooks/useServicePricing";

type Props = {
  pricingCategoryId?: string;
  serviceId?: string;
  serviceName?: string;
  fallback?: number;
  className?: string;
};

/** Shows role-based Service Payment amount from admin pricing matrix. */
export function ServicePaymentBadge({
  pricingCategoryId,
  serviceId,
  serviceName,
  fallback = 0,
  className = "text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none",
}: Props) {
  const { getCharge, loading } = useServicePricing();
  const amount = getCharge({
    categoryId: pricingCategoryId,
    serviceId,
    serviceName,
    fallback,
  });
  const display =
    loading && amount <= 0
      ? "…"
      : amount.toLocaleString("en-IN", {
          minimumFractionDigits: amount % 1 ? 2 : 0,
          maximumFractionDigits: 2,
        });

  return (
    <div className={className}>
      Service Payment : ₹ {display}
    </div>
  );
}
