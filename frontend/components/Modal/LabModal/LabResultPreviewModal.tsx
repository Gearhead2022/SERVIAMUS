"use client";

import ModalHeader from "@/components/Modal/ModalHeader";
import { LabRequest } from "@/types/LabTypes";
import { openLabPrintPage } from "@/utils/lab-print";
import LabResultPreview from "./LabResultPreview";

type Props = {
  backLabel?: string;
  onClose: () => void;
  record: LabRequest | null;
};

export default function LabResultPreviewModal({
  backLabel = "Back to Records",
  onClose,
  record,
}: Props) {
  if (!record?.resultPayload) {
    return null;
  }

  return (
    <ModalHeader
      showModal={true}
      title={`Laboratory Result Preview - ${record.patientName}`}
      subtitle={record.testType}
      meta={`${record.id} - ${record.patientId}`}
      sizeModal="2xlarge"
      onClose={onClose}
    >
      <LabResultPreview
        request={record}
        form={record.resultPayload}
        backLabel={backLabel}
        showPassToDoctor={false}
        onBack={onClose}
        onDownloadPdf={() =>
          openLabPrintPage(record.labId, {
            autoDownload: true,
          })
        }
        onOpenPrintPage={() =>
          openLabPrintPage(record.labId, {
            autoPrint: true,
          })
        }
      />
    </ModalHeader>
  );
}
