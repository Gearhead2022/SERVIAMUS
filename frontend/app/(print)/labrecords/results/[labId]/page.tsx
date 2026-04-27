"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import RoleGuard from "@/guards/RoleGuard";
import LabResultDocument from "@/components/Modal/LabModal/LabResultDocument";
import Button from "@/components/ui/Button";
import { useLabRequest } from "@/hooks/Lab/useLab";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";
import {
  downloadLabResultPdf,
  getLabResultPdfFileName,
} from "@/utils/lab-pdf";

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
        <div className="space-y-3">
          <div className="h-3 w-32 rounded-full bg-slate-200" />
          <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-40 rounded-full bg-slate-200" />
          <div className="h-32 rounded-2xl border border-slate-200 bg-slate-50" />
        </div>
      </div>
    </div>
  );
}

const getPdfErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return `${fallback} (${error.message})`;
  }

  return fallback;
};

export default function LabResultPrintPage() {
  const params = useParams<{ labId: string }>();
  const searchParams = useSearchParams();
  const hasAutoTriggeredPrint = useRef(false);
  const hasAutoDownloaded = useRef(false);
  const shouldCloseAfterPrint = useRef(false);
  const documentRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const labId = Number(params.labId);
  const { data: request, error, isLoading } = useLabRequest(labId);

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);

      if (shouldCloseAfterPrint.current) {
        shouldCloseAfterPrint.current = false;
        window.close();
      }
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!request || !request.resultPayload || !documentRef.current) {
      SweetAlert.errorAlert(
        "Download Failed",
        "The printable laboratory result is not ready yet."
      );
      return;
    }

    try {
      setIsDownloadingPdf(true);
      await downloadLabResultPdf({
        element: documentRef.current,
        fileName: getLabResultPdfFileName(request),
      });
    } catch (error) {
      console.error("Laboratory PDF download failed.", error);
      SweetAlert.errorAlert(
        "Download Failed",
        getPdfErrorMessage(error, "Unable to create the laboratory PDF. Please try again.")
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [request]);

  const handlePrintPage = useCallback((closeAfterPrint = false) => {
    if (!request || !request.resultPayload || !documentRef.current) {
      SweetAlert.errorAlert(
        "Print Failed",
        "The printable laboratory result is not ready yet."
      );
      return;
    }

    shouldCloseAfterPrint.current = closeAfterPrint;
    setIsPrinting(true);
    window.requestAnimationFrame(() => {
      window.print();
    });
  }, [request]);

  useEffect(() => {
    if (
      !request?.resultPayload ||
      !documentRef.current ||
      searchParams.get("download") !== "1" ||
      hasAutoDownloaded.current ||
      isDownloadingPdf ||
      isPrinting
    ) {
      return;
    }

    hasAutoDownloaded.current = true;
    const downloadTimer = window.setTimeout(() => {
      void handleDownloadPdf();
    }, 450);

    return () => window.clearTimeout(downloadTimer);
  }, [
    handleDownloadPdf,
    isDownloadingPdf,
    isPrinting,
    request?.resultPayload,
    searchParams,
  ]);

  useEffect(() => {
    if (
      !request?.resultPayload ||
      !documentRef.current ||
      searchParams.get("autoprint") !== "1" ||
      hasAutoTriggeredPrint.current ||
      isDownloadingPdf ||
      isPrinting
    ) {
      return;
    }

    hasAutoTriggeredPrint.current = true;
    const printTimer = window.setTimeout(() => {
      handlePrintPage(true);
    }, 450);

    return () => window.clearTimeout(printTimer);
  }, [
    handlePrintPage,
    isDownloadingPdf,
    isPrinting,
    request?.resultPayload,
    searchParams,
  ]);

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
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => window.close()}>
                Go Back
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf || isPrinting || !request?.resultPayload}
              >
                {isDownloadingPdf ? "Downloading PDF..." : "Download PDF"}
              </Button>
              <Button
                type="button"
                onClick={() => handlePrintPage()}
                disabled={isDownloadingPdf || isPrinting || !request?.resultPayload}
              >
                {isPrinting ? "Opening Print..." : "Print Result"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <PrintPageSkeleton />
          ) : error ? (
            <div className="rounded-3xl border border-[#f0c6c0] bg-white px-6 py-10 text-center text-sm text-[#9a4f45]">
              {getApiErrorMessage(error, "Unable to load the printable laboratory result.")}
            </div>
          ) : request?.resultPayload ? (
            <div ref={documentRef}>
              <LabResultDocument request={request} form={request.resultPayload} />
            </div>
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
