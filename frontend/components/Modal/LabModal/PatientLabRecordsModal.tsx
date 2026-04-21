"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { usePatientLabRecords } from "@/hooks/Lab/useLab";
import { LabRecordGroup, LabRequest, PatientRecord } from "@/types/LabTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import { getLabRecordGroupLabel, getLabTemplateLabel } from "@/utils/lab-templates";

type Props = {
  patient: PatientRecord;
  onEditRecord: (record: LabRequest) => void;
  onReprintRecord: (labId: number) => void;
};

const groupOrder: LabRecordGroup[] = [
  "hematology",
  "serology",
  "clinical-chemistry",
  "clinical-microscopy",
  "other",
];

const statusBadgeClasses: Record<LabRequest["status"], string> = {
  done: "bg-[#e3f6ea] text-[#237a4e]",
  pending: "bg-[#eef4ff] text-[#305c9b]",
  queued: "bg-[#f4efe0] text-[#8a6a18]",
};

const formatRecordDate = (value: string) =>
  new Date(value).toLocaleString([], {
    day: "2-digit",
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function PatientLabRecordsModal({
  patient,
  onEditRecord,
  onReprintRecord,
}: Props) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [recordGroup, setRecordGroup] = useState<LabRecordGroup | "all">("all");
  const { data: records = [], error, isLoading } = usePatientLabRecords(
    patient.patient_id,
    {
      dateFrom,
      dateTo,
      recordGroup,
    }
  );

  const groupedRecords = useMemo(() => {
    const sections = new Map<LabRecordGroup, LabRequest[]>();

    groupOrder.forEach((group) => sections.set(group, []));

    records.forEach((record) => {
      const currentRecords = sections.get(record.recordGroup) ?? [];
      currentRecords.push(record);
      sections.set(record.recordGroup, currentRecords);
    });

    return groupOrder
      .map((group) => ({
        group,
        items: sections.get(group) ?? [],
      }))
      .filter((section) => section.items.length > 0);
  }, [records]);

  return (
    <div className="space-y-5 p-5">
      <div className="rounded-2xl border border-[#d2ebe6] bg-[#f5fbfa] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b7c76]">
              Laboratory Records
            </p>
            <h3 className="mt-1 text-2xl font-bold text-[#133d37]">{patient.name}</h3>
            <p className="mt-1 text-sm text-[#5f8a83]">
              {patient.patient_code} - {patient.lab_requests_count} laboratory request
              {patient.lab_requests_count === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
            <Input
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
            <Select
              label="Category"
              value={recordGroup}
              onChange={(event) =>
                setRecordGroup(event.target.value as LabRecordGroup | "all")
              }
            >
              <option value="all">All Categories</option>
              {groupOrder.map((group) => (
                <option key={group} value={group}>
                  {getLabRecordGroupLabel(group)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[#456c65]">
            {records.length} encoded laboratory record{records.length === 1 ? "" : "s"} found
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setRecordGroup("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-[#cbe6e1] bg-white px-4 py-8 text-center text-sm text-[#5c8b84]">
          Loading laboratory records...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-[#f1cdc8] bg-white px-4 py-8 text-center text-sm text-[#a35144]">
          {getApiErrorMessage(error, "Unable to load patient laboratory records.")}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cbe6e1] bg-white px-4 py-8 text-center text-sm text-[#5c8b84]">
          No encoded laboratory records matched the selected filters.
        </div>
      ) : (
        groupedRecords.map((section) => (
          <section key={section.group} className="space-y-3">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f5e57]">
                {getLabRecordGroupLabel(section.group)}
              </h4>
              <span className="h-px flex-1 bg-[#dcebe7]" />
              <span className="rounded-full bg-[#ecf6f4] px-3 py-1 text-[11px] font-medium text-[#396f66]">
                {section.items.length} test{section.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-3">
              {section.items.map((record) => (
                <div
                  key={record.labId}
                  className="rounded-2xl border border-[#d5ebe6] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#e6f7f3] px-2 py-1 text-xs font-semibold text-[#2e7a6e]">
                          {record.id}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${statusBadgeClasses[record.status]}`}
                        >
                          {record.status}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-[#173f39]">{record.testType}</p>
                      <p className="text-sm text-[#63867f]">
                        {getLabTemplateLabel(record)} - {formatRecordDate(record.requestedDate)}
                      </p>
                      <p className="text-xs text-[#6f948d]">
                        Requested by {record.requestedBy}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onEditRecord(record)}
                      >
                        Edit Result
                      </Button>
                      <Button type="button" onClick={() => onReprintRecord(record.labId)}>
                        Reprint Result
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
