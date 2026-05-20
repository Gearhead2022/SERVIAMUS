"use client";

import { usePatientLabRecords } from "@/hooks/Lab/useLab";
import { LabRequest, PatientRecord } from "@/types/LabTypes";
import LabRecordsList from "./LabRecordsList";

type Props = {
  patient: PatientRecord;
  onViewResult: (record: LabRequest) => void;
};

export default function PatientLabRecordsModal({
  patient,
  onViewResult,
}: Props) {
  const { data: records = [], error, isLoading } = usePatientLabRecords(
    patient.patient_id
  );

  return (
    <div className="min-h-[560px] bg-[#f8f9fc] px-6 py-5">
      <LabRecordsList
        emptyMessage="No laboratory records yet"
        error={error}
        isLoading={isLoading}
        onViewResult={onViewResult}
        records={records}
      />
    </div>
  );
}
