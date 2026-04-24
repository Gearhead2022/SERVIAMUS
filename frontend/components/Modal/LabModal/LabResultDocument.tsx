"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import {
  formatLabResultValue,
  hasDisplayableLabResultValue,
} from "@/utils/lab";
import {
  getChemistryPanelRows,
  getClinicalChemistryRows,
  resolveChemistryPanelFieldNames,
  resolveClinicalChemistryFieldNames,
  resolveLabTemplate,
  shouldShowClinicalChemistryMealFields,
} from "@/utils/lab-templates";

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
    <div className="result-field min-w-0">
      <p className="result-label text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="result-value mt-1 break-words text-[12px] leading-4 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function PreviewShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      data-lab-result-document
      className="result-paper mx-auto w-full max-w-[8in] rounded-[20px] bg-white p-5 text-sm shadow-xl print:max-w-none print:rounded-none print:p-4 print:shadow-none"
    >
      <header className="result-header border-b border-slate-300 pb-3">
        <div className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-4">
          <div className="flex justify-center">
            <Image
              src="/images/serviamus.jpeg"
              alt="Serviamus logo"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
              priority
              unoptimized
            />
          </div>
          <div className="min-w-0 text-center">
            <h1 className="result-title text-[17px] font-bold uppercase leading-tight text-blue-800">
              SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
            </h1>
            <p className="result-subtitle text-[10px] text-slate-500">
              Puer Sanctus VI Building, Corner Rosario-Verbena Streets, Brgy. 33, Bacolod City
            </p>
            <p className="result-subtitle text-[10px] text-slate-500">
              Mobile No. (034) 4746678
            </p>
          </div>
          <div aria-hidden="true" className="h-14 w-14" />
        </div>
        <h2 className="result-department mt-3 text-center text-sm font-semibold tracking-[0.28em] text-amber-600">
          {title}
        </h2>
      </header>
      {children}
      <footer className="result-footer mt-6 flex justify-between gap-6 border-t border-slate-200 pt-4 text-[10px]">
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
    <div className="result-patient mt-4 space-y-3 [break-inside:avoid]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <PreviewField label="Name" value={request.patientName} />
        <PreviewField label="Patient ID" value={request.patientId} />
        <PreviewField label="Age" value={request.age || "______"} />
        <PreviewField label="Sex" value={request.sex || "______"} />
        <PreviewField label="Requested By" value={request.requestedBy || "__________________"} />
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
    <section className="mt-4 [break-inside:avoid]">
      <h3 className="result-section-title border-b border-slate-200 pb-2 text-[10px] font-bold tracking-[0.22em] text-slate-600">
        {title}
      </h3>
      {children}
    </section>
  );
}

function CompactFieldGrid({
  fields,
}: {
  fields: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {fields.map((field) => (
        <PreviewField key={field.label} label={field.label} value={field.value} />
      ))}
    </div>
  );
}

function CbcDocument({ request, form }: Props) {
  return (
    <PreviewShell title="HEMATOLOGY">
      <PatientBlock request={request} />
      <Section title="COMPLETE BLOOD COUNT">
        <CompactFieldGrid
          fields={[
            { label: "Hemoglobin", value: getValue(form, "Hemoglobin") },
            { label: "RBC Count", value: getValue(form, "rbc_count") },
            { label: "WBC Count", value: getValue(form, "wbc_count") },
            { label: "Platelet Count", value: getValue(form, "platelet_count") },
            { label: "MCV", value: getValue(form, "others_mcv") },
            { label: "MCHC", value: getValue(form, "mchc") },
            { label: "Reticulocyte Count", value: getValue(form, "reticulocyte_count") },
          ]}
        />
      </Section>
      <Section title="DIFFERENTIAL COUNT">
        <CompactFieldGrid
          fields={[
            { label: "Neutrophils (Seg)", value: getValue(form, "nss_1") },
            { label: "Neutrophils (Stab)", value: getValue(form, "nss_2") },
            { label: "NSS 3", value: getValue(form, "nss_3") },
            { label: "Lymphocytes", value: getValue(form, "lymphocytes") },
            { label: "Monocytes", value: getValue(form, "monocytes") },
            { label: "Eosinophils", value: getValue(form, "eosinophils") },
            { label: "Basophils", value: getValue(form, "basophils") },
            { label: "Remarks", value: getValue(form, "others1", "No additional remarks") },
          ]}
        />
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
        <CompactFieldGrid
          fields={[
            { label: "ABO Type", value: getValue(form, "abo_type") },
            { label: "Rh Type", value: getValue(form, "rh_type") },
          ]}
        />
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
        <CompactFieldGrid
          fields={[
            { label: "Color", value: getValue(form, "color") },
            { label: "Time Collected", value: getValue(form, "time_collected") },
            { label: "Consistency", value: getValue(form, "consistency") },
            {
              label: "Time Received",
              value: getValue(form, ["time_received", "time_recieved"]),
            },
          ]}
        />
      </Section>
      <Section title="MICROSCOPIC">
        <CompactFieldGrid
          fields={[
            { label: "Pus Cells", value: `${getValue(form, "pus_cells", "____")} /HPF` },
            { label: "RBC", value: `${getValue(form, "rbc", "____")} /HPF` },
            { label: "Bacteria", value: `${getValue(form, "bacteria", "____")} /HPF` },
          ]}
        />
      </Section>
      <Section title="PARASITES">
        <CompactFieldGrid
          fields={[
            { label: "Hookworm", value: `${getValue(form, "hookworm", "____")} /smear` },
            { label: "Ascaris", value: `${getValue(form, "ascaris", "____")} /smear` },
            { label: "Trichuris", value: `${getValue(form, "trichuris", "____")} /smear` },
            { label: "Strongyloides", value: `${getValue(form, "strongloides", "____")} /smear` },
          ]}
        />
      </Section>
      <Section title="AMOEBA">
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-700">Entamoeba histolytica</p>
            <div className="mt-3 grid gap-3">
              <PreviewField
                label="Cyst"
                value={`${getValue(form, "histolytica_cyst", "____")} /HPF`}
              />
              <PreviewField
                label="Trophozoite"
                value={`${getValue(form, "histolytica_trophozoite", "____")} /HPF`}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-700">Entamoeba coli</p>
            <div className="mt-3 grid gap-3">
              <PreviewField
                label="Cyst"
                value={`${getValue(form, "coli_cyst", "____")} /HPF`}
              />
              <PreviewField
                label="Trophozoite"
                value={`${getValue(form, "coli_trophozoite", "____")} /HPF`}
              />
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
        <CompactFieldGrid
          fields={[
            { label: "Color", value: getValue(form, "color") },
            { label: "Transparency", value: getValue(form, "transparency") },
          ]}
        />
      </Section>
      <Section title="CHEMICAL EXAMINATION">
        <CompactFieldGrid
          fields={[
            { label: "pH", value: getValue(form, "ph_result") },
            { label: "Specific Gravity", value: getValue(form, "spec_grav_result") },
            { label: "Protein", value: getValue(form, "protein") },
            { label: "Nitrite", value: getValue(form, "nitrite") },
            { label: "Glucose", value: getValue(form, "glucose") },
            { label: "Ketones", value: getValue(form, "ketones") },
            { label: "Leukocytes", value: getValue(form, "leukocytes") },
            { label: "Blood", value: getValue(form, "blood") },
          ]}
        />
      </Section>
      <Section title="MICROSCOPIC EXAMINATION">
        <CompactFieldGrid
          fields={[
            { label: "Pus Cells", value: getValue(form, "pus_cells") },
            { label: "RBC", value: getValue(form, "rbc") },
            { label: "Bacteria", value: getValue(form, "bacteria") },
            { label: "Squamous Cell", value: getValue(form, "squamous_cell") },
            { label: "Round Cell", value: getValue(form, "round_cell") },
            { label: "Mucous", value: getValue(form, "mucous") },
            { label: "Crystals", value: getValue(form, "crystals") },
            { label: "Casts", value: getValue(form, "casts") },
          ]}
        />
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
  const fieldNames = resolveClinicalChemistryFieldNames(request);
  const rows = getClinicalChemistryRows(fieldNames);
  const showMealFields = shouldShowClinicalChemistryMealFields(request);

  return (
    <PreviewShell title="CLINICAL CHEMISTRY">
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <div className="result-table mt-3 overflow-hidden rounded-2xl border border-slate-200">
          <div className="result-table-head grid grid-cols-[1.45fr_0.85fr_0.85fr] bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Test</span>
            <span>Result</span>
            <span>Conv.</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.fieldName}
              className="result-table-row grid grid-cols-[1.45fr_0.85fr_0.85fr] border-t border-slate-200 px-4 py-2.5 text-[12px] leading-4 text-slate-700"
            >
              <span>{row.label}</span>
              <span>{getValue(form, row.fieldName, "____")}</span>
              <span>
                {row.conversionFieldName
                  ? getValue(form, row.conversionFieldName, "____")
                  : "N/A"}
              </span>
            </div>
          ))}
        </div>
      </Section>
      {showMealFields ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PreviewField label="Last Meal" value={getValue(form, "last_meal")} />
          <PreviewField label="Time Taken" value={getValue(form, "time_taken")} />
        </div>
      ) : null}
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
        <CompactFieldGrid
          fields={[
            { label: config.fieldLabel, value: getValue(form, config.fieldName) },
            ...(config.conversionFieldName
              ? [
                  {
                    label: config.conversionLabel ?? "Conversion",
                    value: getValue(form, config.conversionFieldName),
                  },
                ]
              : []),
            ...(config.showMealFields
              ? [
                  { label: "Last Meal", value: getValue(form, "last_meal") },
                  { label: "Time Taken", value: getValue(form, "time_taken") },
                ]
              : []),
          ]}
        />
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
        <CompactFieldGrid
          fields={[
            { label: "Test", value: getValue(form, "test") },
            { label: "Method", value: getValue(form, "method") },
            { label: "Specimen", value: getValue(form, "specimen") },
            ...(template.serology?.showDayOfFever
              ? [{ label: "Day of Fever", value: getValue(form, "day_of_fever") }]
              : []),
          ]}
        />
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
        <CompactFieldGrid
          fields={[
            { label: "Test", value: getValue(form, "test") },
            { label: "Method", value: getValue(form, "method") },
            { label: "Specimen", value: getValue(form, "specimen") },
            { label: "Result", value: getValue(form, "result") },
          ]}
        />
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
        <CompactFieldGrid
          fields={[
            { label: "Test Method", value: getValue(form, "test_method") },
            { label: "Lot No.", value: getValue(form, "lot_no") },
            { label: "Expiration Date", value: getValue(form, "exp_date") },
            { label: "Specimen", value: getValue(form, "specimen") },
            { label: "Result", value: getValue(form, "result") },
          ]}
        />
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
  const fieldNames = resolveChemistryPanelFieldNames(request);

  return (
    <PreviewShell title="CHEMISTRY">
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <CompactFieldGrid
          fields={getChemistryPanelRows(fieldNames).map((row) => ({
            label: row.label,
            value: getValue(form, row.fieldName),
          }))}
        />
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
          <div className="result-table-head grid grid-cols-[1.35fr_0.85fr_0.85fr] bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Phase</span>
            <span>Result</span>
            <span>Conv.</span>
          </div>
          {phases.map((phase) => (
            <div
              key={phase.fieldName}
              className="result-table-row grid grid-cols-[1.35fr_0.85fr_0.85fr] border-t border-slate-200 px-4 py-2.5 text-[12px] leading-4 text-slate-700"
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
              <div key={key} className="rounded-2xl border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
