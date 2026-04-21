"use client";

import { useState } from "react";
import ModalHeader from "../ModalHeader";
import LabResultEditor from "./LabResultEditor";
import LabResultPreview from "./LabResultPreview";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import { resolveLabTemplate } from "@/utils/lab-templates";

type Props = {
  request: LabRequest;
  onClose: () => void;
  onComplete: (id: string, delivery: "print" | "doctor", form: LabResultPayload) => void;
};

export default function LabResultsModal({ request, onClose, onComplete }: Props) {
  const [previewForm, setPreviewForm] = useState<LabResultPayload | null>(null);
  const template = resolveLabTemplate(request);

  const finishSubmission = (delivery: "print" | "doctor") => {
    if (!previewForm) {
      return;
    }

    onComplete(request.id, delivery, previewForm);
    onClose();
  };

  return (
    <ModalHeader
      showModal={true}
      title={previewForm ? `Result Preview - ${request.patientName}` : `Laboratory Request - ${template.label}`}
      subtitle={request.testType}
      meta={`${request.id} - ${request.patientId}`}
      onClose={onClose}
    >
      {previewForm ? (
        <LabResultPreview
          request={request}
          form={previewForm}
          onBack={() => setPreviewForm(null)}
          onPassToDoctor={() => finishSubmission("doctor")}
          onOpenPrintPage={() => finishSubmission("print")}
        />
      ) : (
        <LabResultEditor
          request={request}
          onSubmit={(form) => setPreviewForm(form)}
          onCancel={onClose}
        />
      )}
    </ModalHeader>
  );
}
