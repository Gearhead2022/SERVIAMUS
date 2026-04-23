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
  openLabResultPdfForPrint,
} from "@/utils/lab-pdf";

const getPdfErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return `${fallback} (${error.message})`;
  }

  return fallback;
};

export default function LabResultPrintPage() {
  const params = useParams<{ labId: string }>();
  const searchParams = useSearchParams();
  const hasAutoOpenedPrintPdf = useRef(false);
  const hasAutoDownloaded = useRef(false);
  const documentRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const labId = Number(params.labId);
  const { data: request, error, isLoading } = useLabRequest(labId);

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

  const handleOpenPrintablePdf = useCallback(async () => {
    if (!request || !request.resultPayload || !documentRef.current) {
      SweetAlert.errorAlert(
        "Print Failed",
        "The printable laboratory result is not ready yet."
      );
      return;
    }

    try {
      setIsPreparingPrint(true);
      await openLabResultPdfForPrint({
        element: documentRef.current,
        fileName: getLabResultPdfFileName(request),
        targetWindow: window,
      });
    } catch (error) {
      console.error("Laboratory PDF print preparation failed.", error);
      SweetAlert.errorAlert(
        "Print Failed",
        getPdfErrorMessage(
          error,
          "Unable to prepare the laboratory PDF for printing. Please try again."
        )
      );
    } finally {
      setIsPreparingPrint(false);
    }
  }, [request]);

  useEffect(() => {
    if (
      !request?.resultPayload ||
      !documentRef.current ||
      searchParams.get("download") !== "1" ||
      hasAutoDownloaded.current ||
      isDownloadingPdf ||
      isPreparingPrint
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
    isPreparingPrint,
    request?.resultPayload,
    searchParams,
  ]);

  useEffect(() => {
    if (
      !request?.resultPayload ||
      !documentRef.current ||
      searchParams.get("autoprint") !== "1" ||
      hasAutoOpenedPrintPdf.current ||
      isDownloadingPdf ||
      isPreparingPrint
    ) {
      return;
    }

    hasAutoOpenedPrintPdf.current = true;
    const printTimer = window.setTimeout(() => {
      void handleOpenPrintablePdf();
    }, 450);

    return () => window.clearTimeout(printTimer);
  }, [
    handleOpenPrintablePdf,
    isDownloadingPdf,
    isPreparingPrint,
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
                disabled={isDownloadingPdf || isPreparingPrint || !request?.resultPayload}
              >
                {isDownloadingPdf ? "Downloading PDF..." : "Download PDF"}
              </Button>
              <Button
                type="button"
                onClick={handleOpenPrintablePdf}
                disabled={isDownloadingPdf || isPreparingPrint || !request?.resultPayload}
              >
                {isPreparingPrint ? "Preparing Print..." : "Print Result"}
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
