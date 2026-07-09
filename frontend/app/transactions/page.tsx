import { TransactionsPage } from "../../src/screens/TransactionsPage";
import { Suspense } from "react";

export default function TransactionsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading transactions...</div>}>
      <TransactionsPage />
    </Suspense>
  );
}
