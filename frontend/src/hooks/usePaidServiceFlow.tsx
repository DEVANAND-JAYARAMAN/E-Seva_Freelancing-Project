"use client";

import { useState, type ReactNode } from "react";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../components/ServicePaymentScreen";

export type PaidServiceFlowConfig = {
  serviceId: string;
  serviceName: string;
  pricingCategoryId: string;
  retailerCharge: number;
  formData: Record<string, string>;
  files?: File[];
  onDone: () => void;
};

/**
 * Shared form → wallet Pay & Submit → pending list flow.
 * Replaces fake setTimeout "success" submits that never debit or create requests.
 */
export function usePaidServiceFlow(config: PaidServiceFlowConfig) {
  const [phase, setPhase] = useState<"form" | "payment" | "success">("form");

  const startPayment = () => setPhase("payment");

  let paymentView: ReactNode = null;
  if (phase === "success") {
    paymentView = <ServiceSuccessScreen serviceName={config.serviceName} />;
  } else if (phase === "payment") {
    paymentView = (
      <div className="py-6">
        <ServicePaymentScreen
          serviceId={config.serviceId}
          serviceName={config.serviceName}
          retailerCharge={config.retailerCharge}
          pricingCategoryId={config.pricingCategoryId}
          formData={config.formData}
          files={config.files}
          onBack={() => setPhase("form")}
          onSuccess={() => {
            setPhase("success");
            setTimeout(() => {
              setPhase("form");
              config.onDone();
            }, 2500);
          }}
        />
      </div>
    );
  }

  return {
    phase,
    isForm: phase === "form",
    startPayment,
    paymentView,
  };
}
