"use client";

import { useMemo, useState } from "react";
import ModalHeader from "../ModalHeader";
import ClinicalChemistryModal from "./ClinicalChemistryModal";
import HematologyModal from "./HematologyModal";
import ParasitologyModal from "./ParasitologyModal";
import UrinalysisModal from "./UrinalysisModal";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";

type Props = {
  request: LabRequest;
  onClose: () => void;
  onComplete: (id: string, delivery: "print" | "doctor", form: LabResultPayload) => void;
};

type Category = "clinical-chemistry" | "hematology" | "parasitology" | "urinalysis";
type DeliveryOption = "print" | "doctor";

const categoryLabels: Record<Category, string> = {
  "clinical-chemistry": "Clinical Chemistry",
  hematology: "Hematology",
  parasitology: "Parasitology",
  urinalysis: "Urinalysis",
};

function getCategory(testType: string): Category {
  const t = testType.toLowerCase();
  if (t.includes("urinalysis")) return "urinalysis";
  if (
    t.includes("blood count") ||
    t.includes("cbc") ||
    t.includes("hematology") ||
    t.includes("blood typing")
  ) {
    return "hematology";
  }
  if (t.includes("fecal") || t.includes("stool") || t.includes("parasit")) return "parasitology";
  return "clinical-chemistry";
}

function formatLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getValue(form: LabResultPayload, key: string, fallback = "__________________") {
  return form[key]?.trim() || fallback;
}

function PreviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function ParasitologyPreview({
  request,
  form,
}: {
  request: LabRequest;
  form: LabResultPayload;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-[28px] bg-white p-6 text-sm shadow-xl print:shadow-none">
      <header className="border-b border-slate-200 pb-3 text-center">
        <h1 className="text-lg font-bold text-blue-700">SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.</h1>
        <p className="text-xs text-slate-500">Bacolod City, Negros Occidental, Philippines</p>
        <h2 className="mt-2 font-semibold tracking-[0.3em] text-amber-600">PARASITOLOGY</h2>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PreviewField label="Name" value={request.patientName} />
        <PreviewField label="Date" value={new Date().toLocaleDateString("en-CA")} />
        <PreviewField label="Age" value="________" />
        <PreviewField label="Sex" value="________" />
        <div className="col-span-2">
          <PreviewField label="Address" value="__________________________" />
        </div>
      </div>

      <section className="mt-5">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold tracking-[0.24em] text-slate-600">
          MACROSCOPIC
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Color" value={getValue(form, "color")} />
          <PreviewField label="Time Collected" value={getValue(form, "time_collected")} />
          <PreviewField label="Consistency" value={getValue(form, "consistency")} />
          <PreviewField label="Time Received" value={getValue(form, "time_recieved")} />
        </div>
      </section>

      <section className="mt-5">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold tracking-[0.24em] text-slate-600">
          MICROSCOPIC
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Pus Cells" value={`${getValue(form, "pus_cells", "____")} /HPF`} />
          <PreviewField label="RBC" value={`${getValue(form, "rbc", "____")} /HPF`} />
          <PreviewField label="Bacteria" value={`${getValue(form, "bacteria", "____")} /HPF`} />
        </div>
      </section>

      <section className="mt-5">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold tracking-[0.24em] text-slate-600">
          PARASITES
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <PreviewField label="Hookworm" value={`${getValue(form, "hookworm", "____")} /smear`} />
          <PreviewField label="Ascaris lumbricoides" value={`${getValue(form, "ascaris", "____")} /smear`} />
          <PreviewField label="Trichuris trichiura" value={`${getValue(form, "trichuris", "____")} /smear`} />
          <PreviewField label="Strongyloides" value={`${getValue(form, "strongloides", "____")} /smear`} />
        </div>
      </section>

      <section className="mt-5">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold tracking-[0.24em] text-slate-600">
          AMOEBA
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-700">Entamoeba histolytica</p>
            <div className="mt-3 grid gap-3">
              <PreviewField label="Cyst" value={`${getValue(form, "histolytica_cyst", "____")} /HPF`} />
              <PreviewField
                label="Trophozoite"
                value={`${getValue(form, "histolytica_trophozoite", "____")} /HPF`}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-700">Entamoeba coli</p>
            <div className="mt-3 grid gap-3">
              <PreviewField label="Cyst" value={`${getValue(form, "coli_cyst", "____")} /HPF`} />
              <PreviewField label="Trophozoite" value={`${getValue(form, "coli_trophozoite", "____")} /HPF`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h3 className="border-b border-slate-200 pb-2 text-xs font-bold tracking-[0.24em] text-slate-600">
          REMARKS
        </h3>
        <p className="mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "others", "NO INTESTINAL PARASITE SEEN IN DIRECT FECAL SMEAR")}
        </p>
      </section>

      <footer className="mt-8 flex justify-between gap-6 text-xs">
        <div>
          <p className="font-semibold text-slate-700">Pathologist</p>
          <p className="mt-1 text-slate-500">Dr. Greg Ryan T. Gerongano</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-700">Medical Technologist</p>
          <p className="mt-1 text-slate-500">Jhenny S. Alvarez, RMT</p>
        </div>
      </footer>
    </div>
  );
}

function GenericPreview({
  request,
  category,
  form,
}: {
  request: LabRequest;
  category: Category;
  form: LabResultPayload;
}) {
  const rows = Object.entries(form).filter(([, value]) => value.trim() !== "");

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          Result Preview
        </p>
        <h3 className="mt-2 text-2xl font-bold text-slate-800">{categoryLabels[category]}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {request.patientName} • {request.patientId} • {request.testType}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.length ? (
          rows.map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {formatLabel(key)}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No values entered yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function LabResultsModal({ request, onClose, onComplete }: Props) {
  const [previewForm, setPreviewForm] = useState<LabResultPayload | null>(null);
  const category = useMemo(() => getCategory(request.testType), [request.testType]);

  const handleSaveResults = (form: LabResultPayload) => {
    setPreviewForm(form);
  };

  const finishSubmission = (delivery: DeliveryOption) => {
    if (!previewForm) return;
    if (delivery === "print") {
      window.print();
    }
    onComplete(request.id, delivery, previewForm);
    onClose();
  };

  return (
    <ModalHeader
      showModal={true}
      title={previewForm ? `Preview Result — ${request.patientName}` : `Encode Results — ${request.patientName}`}
      onClose={onClose}
    >
      <div className="flex items-center gap-3 border-b border-[#d2ebe6] bg-[#f5fbfa] px-5 py-3">
        <div>
          <p className="text-xs font-medium text-[#2f5e57]">
            {request.id} • {request.patientId}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#133d37]">{request.testType}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              request.priority === "Urgent"
                ? "bg-[#fdece7] text-[#c05738]"
                : "bg-[#e6f7f3] text-[#2e7a6e]"
            }`}
          >
            {request.priority}
          </span>
          <span className="rounded-md bg-#23324a-100 px-2 py-1 text-xs font-semibold text-teal-700">
            {categoryLabels[category]}
          </span>
        </div>
      </div>

      {previewForm ? (
        <div className="space-y-5 bg-slate-100 p-5">
          {category === "parasitology" ? (
            <ParasitologyPreview request={request} form={previewForm} />
          ) : (
            <GenericPreview request={request} category={category} form={previewForm} />
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-1 pt-5">
            <button
              type="button"
              onClick={() => setPreviewForm(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={() => finishSubmission("doctor")}
              className="rounded-lg border border-[#152859] px-4 py-2 text-sm font-semibold text-[#152859] transition hover:bg-[#eef2ff]"
            >
              Pass Data to Doctor
            </button>
            <button
              type="button"
              onClick={() => finishSubmission("print")}
              className="rounded-lg bg-[#152859] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c3570]"
            >
              Print Form
            </button>
          </div>
        </div>
      ) : (
        <>
          {category === "clinical-chemistry" && (
            <ClinicalChemistryModal
              initialValues={request.resultPayload}
              onSubmit={handleSaveResults}
              onCancel={onClose}
            />
          )}
          {category === "hematology" && (
            <HematologyModal
              initialValues={request.resultPayload}
              onSubmit={handleSaveResults}
              onCancel={onClose}
            />
          )}
          {category === "parasitology" && (
            <ParasitologyModal
              initialValues={request.resultPayload}
              onSubmit={handleSaveResults}
              onCancel={onClose}
            />
          )}
          {category === "urinalysis" && (
            <UrinalysisModal
              initialValues={request.resultPayload}
              onSubmit={handleSaveResults}
              onCancel={onClose}
            />
          )}
        </>
      )}
    </ModalHeader>
  );
}
