"use client";

import Button from "@/components/ui/Button";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import LabResultDocument from "./LabResultDocument";

type Props = {
  request: LabRequest;
  form: LabResultPayload;
  onBack: () => void;
  onDownloadPdf?: () => void;
  onOpenPrintPage: () => void;
  onPassToDoctor?: () => void;
  onDone?: () => void;
  backLabel?: string;
  showPassToDoctor?: boolean;
  showDoneButton?: boolean;
};

export default function LabResultPreview({
  backLabel = "Back to Edit",
  form,
  onBack,
  onDownloadPdf,
  onDone,
  onOpenPrintPage,
  onPassToDoctor,
  request,
  showPassToDoctor = true,
  showDoneButton = false,
}: Props) {
  return (
    <div className="lab-print-sheet space-y-5 bg-slate-100 p-5 print:bg-white print:p-0">
      <div className="rounded-2xl border border-[#d7e7e3] bg-white p-4 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f8a83]">
              Result Preview
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#143a35]">
              {request.patientName} - {request.testType}
            </h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#63867f]">
                Request
              </p>
              <p className="mt-1 text-sm font-medium text-[#173f39]">{request.id}</p>
            </div>
            <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#63867f]">
                Patient Code
              </p>
              <p className="mt-1 text-sm font-medium text-[#173f39]">{request.patientId}</p>
            </div>
          </div>
        </div>
      </div>

      <LabResultDocument request={request} form={form} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                    </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onBack}>
              {backLabel}
            </Button>
            {showPassToDoctor && onPassToDoctor ? (
              <Button type="button" variant="neutral" onClick={onPassToDoctor}>
                Pass Data to Doctor
              </Button>
            ) : null}
            {showDoneButton && onDone ? (
              <Button type="button" variant="neutral" onClick={onDone}>
                Done
              </Button>
            ) : null}
            {onDownloadPdf ? (
              <Button type="button" variant="secondary" onClick={onDownloadPdf}>
                Download PDF
              </Button>
            ) : null}
            <Button type="button" onClick={onOpenPrintPage}>
              Reprint Result
            </Button>
          </div>
                      <div>
                      </div>
        </div>
      </div>
    </div>
  );
}
