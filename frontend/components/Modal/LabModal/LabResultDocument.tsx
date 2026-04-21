"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import {
  formatLabResultValue,
  hasDisplayableLabResultValue,
} from "@/utils/lab";
import { resolveLabTemplate } from "@/utils/lab-templates";

type Props = {
  request: LabRequest;
  form: LabResultPayload;
};

function getValue(
  form: LabResultPayload,
  keys: string | string[],
  fallback = "__________________"
) {
  const valueKeys = Array.isArray(keys) ? keys : [keys];

  for (const key of valueKeys) {
    const value = form[key];

    if (hasDisplayableLabResultValue(value)) {
      return formatLabResultValue(value, fallback);
    }
  }

  return fallback;
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-field">
      <p className="result-label text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="result-value mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function PreviewShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="result-paper mx-auto w-full max-w-3xl rounded-[28px] bg-white p-6 text-sm shadow-xl print:shadow-none">
      <header className="result-header border-b border-slate-300 pb-3">
        <div className="flex items-center gap-3">
          <Image
            src="/images/serviamus.jpeg"
            alt="Serviamus logo"
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1 text-center">
            <h1 className="result-title text-lg font-bold uppercase text-blue-800">
              SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
            </h1>
            <p className="result-subtitle text-[11px] text-slate-500">
              Puer Sanctus VI Building, Corner Rosario-Verbena Streets, Brgy. 33, Bacolod City
            </p>
            <p className="result-subtitle text-[11px] text-slate-500">
              Mobile No. (034) 4746678
            </p>
          </div>
        </div>
        <h2 className="result-department mt-2 text-center font-semibold tracking-[0.3em] text-amber-600">
          {title}
        </h2>
      </header>
      {children}
      <footer className="result-footer mt-8 flex justify-between gap-6 border-t border-slate-200 pt-5 text-xs">
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

function PatientBlock({ request }: { request: LabRequest }) {
  return (
    <div className="result-patient mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <PreviewField label="Name" value={request.patientName} />
        <PreviewField label="Date" value={new Date().toLocaleDateString("en-CA")} />
        <PreviewField label="Age" value={request.age || "______"} />
        <PreviewField label="Sex" value={request.sex || "______"} />
        <PreviewField label="Requested By" value={request.requestedBy || "__________________"} />
        <PreviewField label="Patient ID" value={request.patientId} />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <PreviewField label="Address" value={request.address || "__________________"} />
      </div>
    </div>
  );
}

function Section({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="mt-5">
      <h3 className="result-section-title border-b border-slate-200 pb-2 text-xs font-bold tracking-[0.24em] text-slate-600">
        {title}
      </h3>
      {children}
    </section>
  );
}

function CbcDocument({ request, form }: Props) {
  return (
    <PreviewShell title="HEMATOLOGY">
      <PatientBlock request={request} />
      <Section title="COMPLETE BLOOD COUNT">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Hemoglobin" value={getValue(form, "Hemoglobin")} />
          <PreviewField label="RBC Count" value={getValue(form, "rbc_count")} />
          <PreviewField label="WBC Count" value={getValue(form, "wbc_count")} />
          <PreviewField label="Platelet Count" value={getValue(form, "platelet_count")} />
          <PreviewField label="MCV" value={getValue(form, "others_mcv")} />
          <PreviewField label="MCHC" value={getValue(form, "mchc")} />
          <PreviewField label="Reticulocyte Count" value={getValue(form, "reticulocyte_count")} />
        </div>
      </Section>
      <Section title="DIFFERENTIAL COUNT">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Neutrophils (Seg)" value={getValue(form, "nss_1")} />
          <PreviewField label="Neutrophils (Stab)" value={getValue(form, "nss_2")} />
          <PreviewField label="NSS 3" value={getValue(form, "nss_3")} />
          <PreviewField label="Lymphocytes" value={getValue(form, "lymphocytes")} />
          <PreviewField label="Monocytes" value={getValue(form, "monocytes")} />
          <PreviewField label="Eosinophils" value={getValue(form, "eosinophils")} />
          <PreviewField label="Basophils" value={getValue(form, "basophils")} />
          <PreviewField label="Remarks" value={getValue(form, "others1", "No additional remarks")} />
        </div>
      </Section>
      <Section title="FINAL REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "others2", "No additional remarks")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function BloodTypingDocument({ request, form }: Props) {
  return (
    <PreviewShell title="BLOOD TYPING">
      <PatientBlock request={request} />
      <Section title="RESULT">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="ABO Type" value={getValue(form, "abo_type")} />
          <PreviewField label="Rh Type" value={getValue(form, "rh_type")} />
        </div>
      </Section>
      <Section title="REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "others2", "No additional remarks")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function ParasitologyDocument({ request, form }: Props) {
  return (
    <PreviewShell title="PARASITOLOGY">
      <PatientBlock request={request} />
      <Section title="MACROSCOPIC">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Color" value={getValue(form, "color")} />
          <PreviewField label="Time Collected" value={getValue(form, "time_collected")} />
          <PreviewField label="Consistency" value={getValue(form, "consistency")} />
          <PreviewField label="Time Received" value={getValue(form, ["time_received", "time_recieved"])} />
        </div>
      </Section>
      <Section title="MICROSCOPIC">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Pus Cells" value={`${getValue(form, "pus_cells", "____")} /HPF`} />
          <PreviewField label="RBC" value={`${getValue(form, "rbc", "____")} /HPF`} />
          <PreviewField label="Bacteria" value={`${getValue(form, "bacteria", "____")} /HPF`} />
        </div>
      </Section>
      <Section title="PARASITES">
        <div className="result-grid mt-3 grid gap-2 sm:grid-cols-2">
          <PreviewField label="Hookworm" value={`${getValue(form, "hookworm", "____")} /smear`} />
          <PreviewField label="Ascaris" value={`${getValue(form, "ascaris", "____")} /smear`} />
          <PreviewField label="Trichuris" value={`${getValue(form, "trichuris", "____")} /smear`} />
          <PreviewField label="Strongyloides" value={`${getValue(form, "strongloides", "____")} /smear`} />
        </div>
      </Section>
      <Section title="AMOEBA">
        <div className="result-two-column mt-3 grid gap-4 sm:grid-cols-2">
          <div className="result-card rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-700">Entamoeba histolytica</p>
            <div className="result-stack mt-3 grid gap-3">
              <PreviewField label="Cyst" value={`${getValue(form, "histolytica_cyst", "____")} /HPF`} />
              <PreviewField
                label="Trophozoite"
                value={`${getValue(form, "histolytica_trophozoite", "____")} /HPF`}
              />
            </div>
          </div>
          <div className="result-card rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-700">Entamoeba coli</p>
            <div className="result-stack mt-3 grid gap-3">
              <PreviewField label="Cyst" value={`${getValue(form, "coli_cyst", "____")} /HPF`} />
              <PreviewField label="Trophozoite" value={`${getValue(form, "coli_trophozoite", "____")} /HPF`} />
            </div>
          </div>
        </div>
      </Section>
      <Section title="REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "others", "No intestinal parasite seen in direct fecal smear")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function UrinalysisDocument({ request, form }: Props) {
  return (
    <PreviewShell title="URINALYSIS">
      <PatientBlock request={request} />
      <Section title="PHYSICAL EXAMINATION">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Color" value={getValue(form, "color")} />
          <PreviewField label="Transparency" value={getValue(form, "transparency")} />
        </div>
      </Section>
      <Section title="CHEMICAL EXAMINATION">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="pH" value={getValue(form, "ph_result")} />
          <PreviewField label="Specific Gravity" value={getValue(form, "spec_grav_result")} />
          <PreviewField label="Protein" value={getValue(form, "protein")} />
          <PreviewField label="Nitrite" value={getValue(form, "nitrite")} />
          <PreviewField label="Glucose" value={getValue(form, "glucose")} />
          <PreviewField label="Ketones" value={getValue(form, "ketones")} />
          <PreviewField label="Leukocytes" value={getValue(form, "leukocytes")} />
          <PreviewField label="Blood" value={getValue(form, "blood")} />
        </div>
      </Section>
      <Section title="MICROSCOPIC EXAMINATION">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Pus Cells" value={getValue(form, "pus_cells")} />
          <PreviewField label="RBC" value={getValue(form, "rbc")} />
          <PreviewField label="Bacteria" value={getValue(form, "bacteria")} />
          <PreviewField label="Squamous Cell" value={getValue(form, "squamous_cell")} />
          <PreviewField label="Round Cell" value={getValue(form, "round_cell")} />
          <PreviewField label="Mucous" value={getValue(form, "mucous")} />
          <PreviewField label="Crystals" value={getValue(form, "crystals")} />
          <PreviewField label="Casts" value={getValue(form, "casts")} />
        </div>
      </Section>
      <Section title="REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "others", "No additional remarks")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function ClinicalChemistryDocument({ request, form }: Props) {
  const rows: Array<[string, string, string?]> = [
    ["FBS", "FBS", "FBS_conv"],
    ["RBS", "RBS", "RBS_conv"],
    ["BUN", "BUN", "BUN_conv"],
    ["Creatinine", "creatinine", "creatinine_conv"],
    ["Uric Acid", "uric_acid", "uric_acid_conv"],
    ["Total Cholesterol", "cholesterol", "cholesterol_conv"],
    ["HDL Cholesterol", "hdl_cholesterol", "hdl_cholesterol_conv"],
    ["LDL Cholesterol", "ldl_cholesterol", "ldl_cholesterol_conv"],
    ["Triglycerides", "triglycerides", "triglycerides_conv"],
    ["SGPT", "sgpt"],
  ];

  return (
    <PreviewShell title="CLINICAL CHEMISTRY">
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <div className="result-table mt-3 overflow-hidden rounded-2xl border border-slate-200">
          <div className="result-table-head grid grid-cols-[1.2fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Test</span>
            <span>Result</span>
            <span>Conv.</span>
          </div>
          {rows.map(([label, valueKey, convKey]) => (
            <div
              key={valueKey}
              className="result-table-row grid grid-cols-[1.2fr_1fr_1fr] border-t border-slate-200 px-4 py-3 text-sm text-slate-700"
            >
              <span>{label}</span>
              <span>{getValue(form, valueKey, "____")}</span>
              <span>{convKey ? getValue(form, convKey, "____") : "N/A"}</span>
            </div>
          ))}
        </div>
      </Section>
      <div className="result-two-column mt-5 grid gap-4 sm:grid-cols-2">
        <PreviewField label="Last Meal" value={getValue(form, "last_meal")} />
        <PreviewField label="Time Taken" value={getValue(form, "time_taken")} />
      </div>
    </PreviewShell>
  );
}

function SingleChemistryDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);
  const config = template.singleChemistry;

  if (!config) {
    return <GenericDocument request={request} form={form} title={template.label.toUpperCase()} />;
  }

  return (
    <PreviewShell title={template.label.toUpperCase()}>
      <PatientBlock request={request} />
      <Section title="RESULT">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label={config.fieldLabel} value={getValue(form, config.fieldName)} />
          {config.conversionFieldName ? (
            <PreviewField
              label={config.conversionLabel ?? "Conversion"}
              value={getValue(form, config.conversionFieldName)}
            />
          ) : null}
          {config.showMealFields ? (
            <>
              <PreviewField label="Last Meal" value={getValue(form, "last_meal")} />
              <PreviewField label="Time Taken" value={getValue(form, "time_taken")} />
            </>
          ) : null}
        </div>
      </Section>
      <Section title="REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "remarks", "No additional remarks")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function SerologyDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);

  return (
    <PreviewShell title={template.label.toUpperCase()}>
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Test" value={getValue(form, "test")} />
          <PreviewField label="Method" value={getValue(form, "method")} />
          <PreviewField label="Specimen" value={getValue(form, "specimen")} />
          {template.serology?.showDayOfFever ? (
            <PreviewField label="Day of Fever" value={getValue(form, "day_of_fever")} />
          ) : null}
        </div>
      </Section>
      <Section title="RESULT">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "result", "No result entered")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function FecalOccultBloodDocument({ request, form }: Props) {
  return (
    <PreviewShell title="FECAL OCCULT BLOOD TEST">
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Test" value={getValue(form, "test")} />
          <PreviewField label="Method" value={getValue(form, "method")} />
          <PreviewField label="Specimen" value={getValue(form, "specimen")} />
          <PreviewField label="Result" value={getValue(form, "result")} />
        </div>
      </Section>
      <Section title="REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "remarks", "No additional remarks")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function Hba1cDocument({ request, form }: Props) {
  return (
    <PreviewShell title="HBA1C">
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Test Method" value={getValue(form, "test_method")} />
          <PreviewField label="Lot No." value={getValue(form, "lot_no")} />
          <PreviewField label="Expiration Date" value={getValue(form, "exp_date")} />
          <PreviewField label="Specimen" value={getValue(form, "specimen")} />
          <PreviewField label="Result" value={getValue(form, "result")} />
        </div>
      </Section>
      <Section title="INTERPRETATION">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "result_interpretation", "No interpretation entered")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function ChemistryPanelDocument({ request, form }: Props) {
  return (
    <PreviewShell title="CHEMISTRY">
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <div className="result-grid mt-3 grid grid-cols-2 gap-3">
          <PreviewField label="Sodium" value={getValue(form, "sodium")} />
          <PreviewField label="Potassium" value={getValue(form, "potassium")} />
          <PreviewField label="Chloride" value={getValue(form, "chloride")} />
          <PreviewField label="Ionized Calcium" value={getValue(form, "ionized_calcium")} />
        </div>
      </Section>
      <Section title="REMARKS">
        <p className="result-remarks mt-3 text-sm font-medium text-blue-600">
          {getValue(form, "others", "No additional remarks")}
        </p>
      </Section>
    </PreviewShell>
  );
}

function OgttDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);
  const phases = template.ogtt?.phases ?? [];

  return (
    <PreviewShell title={template.label.toUpperCase()}>
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <div className="result-table mt-3 overflow-hidden rounded-2xl border border-slate-200">
          <div className="result-table-head grid grid-cols-[1.2fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Phase</span>
            <span>Result</span>
            <span>Conv.</span>
          </div>
          {phases.map((phase) => (
            <div
              key={phase.fieldName}
              className="result-table-row grid grid-cols-[1.2fr_1fr_1fr] border-t border-slate-200 px-4 py-3 text-sm text-slate-700"
            >
              <span>{phase.label}</span>
              <span>{getValue(form, phase.fieldName, "____")}</span>
              <span>{getValue(form, phase.conversionFieldName, "____")}</span>
            </div>
          ))}
        </div>
      </Section>
    </PreviewShell>
  );
}

function GenericDocument({
  request,
  form,
  title,
}: Props & { title: string }) {
  const rows = Object.entries(form).filter(([, value]) =>
    hasDisplayableLabResultValue(value)
  );

  return (
    <PreviewShell title={title}>
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {rows.length ? (
            rows.map(([key, value]) => (
              <div key={key} className="result-card rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="mt-2 text-sm text-slate-700">{formatLabResultValue(value)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No values entered yet.</p>
          )}
        </div>
      </Section>
    </PreviewShell>
  );
}

export default function LabResultDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);

  if (template.key === "cbc") {
    return <CbcDocument request={request} form={form} />;
  }

  if (template.key === "blood-typing") {
    return <BloodTypingDocument request={request} form={form} />;
  }

  if (template.key === "parasitology") {
    return <ParasitologyDocument request={request} form={form} />;
  }

  if (template.key === "urinalysis") {
    return <UrinalysisDocument request={request} form={form} />;
  }

  if (template.key === "clinical-chemistry-panel") {
    return <ClinicalChemistryDocument request={request} form={form} />;
  }

  if (template.key === "single-chemistry") {
    return <SingleChemistryDocument request={request} form={form} />;
  }

  if (
    template.key === "serology" ||
    template.key === "dengue" ||
    template.key === "pregnancy-test"
  ) {
    return <SerologyDocument request={request} form={form} />;
  }

  if (template.key === "fecal-occult-blood") {
    return <FecalOccultBloodDocument request={request} form={form} />;
  }

  if (template.key === "hba1c") {
    return <Hba1cDocument request={request} form={form} />;
  }

  if (template.key === "chemistry-panel") {
    return <ChemistryPanelDocument request={request} form={form} />;
  }

  if (template.key === "ogtt") {
    return <OgttDocument request={request} form={form} />;
  }

  return <GenericDocument request={request} form={form} title={request.testType.toUpperCase()} />;
}
