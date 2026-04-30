"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import ExternalLabRequestDocument from "@/components/Modal/LabModal/ExternalLabRequestDocument";
import Button from "@/components/ui/Button";
import RoleGuard from "@/guards/RoleGuard";
import { readExternalLabRequestPrintDraft } from "@/utils/lab-request-print";

function PrintPageSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-[#c8e4de] bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-[8in] space-y-5">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <div className="h-14 w-14 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded-full bg-slate-200" />
            <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            <div className="h-3 w-1/3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[52px] rounded-2xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
        <div className="h-28 rounded-2xl border border-slate-200 bg-slate-50" />
        <div className="h-20 rounded-2xl border border-slate-200 bg-slate-50" />
      </div>
    </div>
  );
}

export default function ExternalLabRequestPrintPage() {
  const searchParams = useSearchParams();
  const hasAutoTriggeredPrint = useRef(false);
  const draftId = searchParams.get("draft");
  const shouldAutoPrint = searchParams.get("autoprint") === "1";
  const draft = useSyncExternalStore(
    () => () => {},
    () => (draftId ? readExternalLabRequestPrintDraft(draftId) : null),
    () => undefined
  );
  const isLoading = typeof draft === "undefined";

  useEffect(() => {
    if (!draft || !shouldAutoPrint || hasAutoTriggeredPrint.current) {
      return;
    }

    hasAutoTriggeredPrint.current = true;

    const printTimer = window.setTimeout(() => {
      window.print();
    }, 450);

    return () => window.clearTimeout(printTimer);
  }, [draft, shouldAutoPrint]);

  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "STAFF"]}>
      <div className="min-h-screen bg-[#eef4f3] px-4 py-6 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b7c76]">
                Laboratory Print View
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#133d37]">
                Print External Laboratory Request
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => window.close()}>
                Go Back
              </Button>
              <Button type="button" onClick={() => window.print()} disabled={!draft}>
                Print Request
              </Button>
            </div>
          </div>

          {isLoading ? (
            <PrintPageSkeleton />
          ) : draft ? (
            <ExternalLabRequestDocument request={draft} />
          ) : (
            <div className="rounded-3xl border border-[#f0c6c0] bg-white px-6 py-10 text-center text-sm text-[#9a4f45]">
              Unable to load the external laboratory request draft. Reopen the request form and try
              again.
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
