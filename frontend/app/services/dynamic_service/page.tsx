"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DynamicServicePage } from "../../../src/screens/services/dynamic/DynamicServicePage";

function PageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <div>Invalid Service ID</div>;

  return <DynamicServicePage serviceId={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
