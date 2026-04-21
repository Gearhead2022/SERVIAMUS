"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RoleGuard from "@/guards/RoleGuard";
import LabResultDocument from "@/components/Modal/LabModal/LabResultDocument";
import Button from "@/components/ui/Button";
import { useLabRequest } from "@/hooks/Lab/useLab";
import { getApiErrorMessage } from "@/utils/api-error";

export default function LabResultPrintPage() {
  const params = useParams<{ labId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAutoPrinted = useRef(false);
  const labId = Number(params.labId);
  const { data: request, error, isLoading } = useLabRequest(labId);

  useEffect(() => {
    if (!request || searchParams.get("autoprint") !== "1" || hasAutoPrinted.current) {
      return;
    }

    hasAutoPrinted.current = true;
    const printTimer = window.setTimeout(() => {
      window.print();
    }, 350);

    return () => window.clearTimeout(printTimer);
  }, [request, searchParams]);

  return (
    <RoleGuard allowedRoles={["ADMIN", "LAB", "LABORATORY"]}>
      <div className="min-h-screen bg-[#eef4f3] px-4 py-6 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b7c76]">
                Laboratory Print View
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#133d37]">Print Laboratory Result</h1>
              <p className="mt-1 text-sm text-[#5f8a83]">
                Use the browser print dialog to print or save this result as PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button type="button" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
              Loading printable result...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[#f0c6c0] bg-white px-6 py-10 text-center text-sm text-[#9a4f45]">
              {getApiErrorMessage(error, "Unable to load the printable laboratory result.")}
            </div>
          ) : request?.resultPayload ? (
            <LabResultDocument request={request} form={request.resultPayload} />
          ) : (
            <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
              No laboratory result has been encoded for this request yet.
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
