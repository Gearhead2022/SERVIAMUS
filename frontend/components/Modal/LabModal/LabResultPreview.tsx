"use client";

import Button from "@/components/ui/Button";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import LabResultDocument from "./LabResultDocument";

type Props = {
  request: LabRequest;
  form: LabResultPayload;
  onBack: () => void;
  onOpenPrintPage: () => void;
  onPassToDoctor: () => void;
  showPassToDoctor?: boolean;
};

export default function LabResultPreview({
  form,
  onBack,
  onOpenPrintPage,
  onPassToDoctor,
  request,
  showPassToDoctor = true,
}: Props) {
  return (
    <div className="lab-print-sheet space-y-5 bg-slate-100 p-5 print:bg-white print:p-0">
      <LabResultDocument request={request} form={form} />

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-1 pt-5 print:hidden">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back to Edit
        </Button>
        {showPassToDoctor ? (
          <Button type="button" variant="neutral" onClick={onPassToDoctor}>
            Pass Data to Doctor
          </Button>
        ) : null}
        <Button type="button" onClick={onOpenPrintPage}>
          Open Print Page
        </Button>
      </div>
    </div>
  );
}
