"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import {
  formatLabResultValue,
  hasDisplayableLabResultValue,
} from "@/utils/lab";
import {
  getLabResultPersonnelDisplay,
  isLabResultMetaField,
} from "@/utils/lab-personnel";
import {
  getChemistryPanelRows,
  getClinicalChemistryRows,
  resolveChemistryPanelFieldNames,
  resolveClinicalChemistryFieldNames,
  resolveLabTemplate,
  shouldShowClinicalChemistryMealFields,
} from "@/utils/lab-templates";
import { formatDate } from "@/utils/Date";

type Props = {
  displayMode?: "preview" | "print";
  request: LabRequest;
  form: LabResultPayload;
};

function LabResultRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_.01fr_1fr_1fr] border-b border-r border-slate-200 last:border-b-0">
      <div className="px-4 py-1 text-[12px] font-medium text-slate-700 uppercase flex items-center">
        {label}
      </div>
      <p className="text-black py-1 flex items-center">:</p>
      <div className="px-4 py-1 text-[12px] text-black font-bold uppercase flex items-center">
        {value}
      </div>
      <div className="px-4 py-1 text-[12px] text-slate-600 text-right">
        {unit}
      </div>
    </div>
  );
}

function PersonnelFooterBlock({
  label,
  primaryLine,
  secondaryLine,
  textAlign = "left",
}: {
  label: string;
  primaryLine: string;
  secondaryLine?: string;
  textAlign?: "left" | "right";
}) {
  return (
    <div
      className='text-center'
    >
      <p className="text-[15px] text-slate-900 font-semibold mb-1 border-b border-black">
        {label.toUpperCase()}
      </p>

      <div className="min-w-[220px]">
        <p className="pb-1 min-h-[22px] text-gray-700">
          <span className="font-medium">
            License No. :&nbsp;
          </span>{primaryLine || "\u00A0"}
        </p>

        <p className="text-[12px] text-center text-gray-700 font-semibold">
          {secondaryLine || "\u00A0"}
        </p>
      </div>
    </div>
  );
}
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
function PreviewField({
  label,
  value,
  col = 1,
}: {
  label: string;
  value: string;
  col?: number;
}) {
  return (
    <div
      className="result-field min-w-0"
      style={{
        gridColumn: `span ${col} / span ${col}`,
      }}
    >
      <p className="result-label text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
        {label}
      </p>

      <p className="result-value mt-1 break-words font-bold text-[13px] leading-4 text-gray-600 bg-slate-800/7 px-2">
        {value ? value.toUpperCase() : value}
      </p>
    </div>
  );
}

function PreviewFieldv2({
  label,
  value,
  col = 1,
}: {
  label: string;
  value: string;
  col?: number;
}) {
  return (
    <div
      className="result-field min-w-0 flex gap-1 pb-4"
      style={{
        gridColumn: `span ${col} / span ${col}`,
      }}
    >
      <p className="result-label text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
        {label} :
      </p>

      <p className="result-value break-words font-bold text-[13px] leading-4 text-gray-600 border-b w-20 indent-5">
        {value.toUpperCase()}
      </p>
    </div>
  );
}

function PreviewShell({
  title,
  subTitle,
  children,
  form,
}: {
  title: string;
  subTitle?: string;
  children: ReactNode;
  form: LabResultPayload;
}) {
  const personnelDisplay = getLabResultPersonnelDisplay(form);

  return (
    <div
      data-lab-result-document
      className="result-paper mx-auto w-full max-w-[8in] min-h-[10.3in] bg-white p-5 text-sm shadow-xl flex flex-col print:shadow-none print:p-0"
    >
      <header className="result-header pb-3">
        <div className="grid grid-cols-[4.1rem_1fr_3.1rem] items-center gap-4 pb-2 border-b-2 border-blue-300">
          <div className="flex justify-center">
            <Image
              src="/images/serviamus.jpeg"
              alt="Serviamus logo"
              width={58}
              height={58}
              className="h-17 w-17 rounded-full object-cover"
              priority
              unoptimized
            />
          </div>
          <div className="min-w-0 text-center"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
            }}>
            <h1 className="result-title text-[19px] font-bold uppercase leading-tight tracking-[1.5px] text-blue-800">
              SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
            </h1>
            <p className="result-subtitle text-[10px] text-gray-700">
              Puer Sanctus VI Building, Corner Rosario-Verbena Streets, Brgy. 33, Bacolod City, Negros Occidental, Philippines, 6100
            </p>
            <p className="result-subtitle text-[10px] text-gray-700">
              Mobile No. (034) 4746678 | 09369513486
            </p>
          </div>
          <div aria-hidden="true" className="h-14 w-14" />
        </div>
        <h2 className="result-department mt-3 text-center text-lg font-bold tracking-[0.1em] text-amber-600">
          {title}
        </h2>
        <h2 className="result-department text-center text-sm font-semibold tracking-[0.28em] text-gray-600">
          {subTitle ? (subTitle) : ''}
        </h2>
      </header>
      {children}
      <footer className="result-footer mt-auto pb-5 flex justify-between gap-6 border-t border-slate-200 pt-4 text-[14px]">
        <PersonnelFooterBlock
          label={personnelDisplay.pathologist.primaryLine}
          primaryLine={personnelDisplay.pathologist.licenseNo ?? ''}
          secondaryLine={'Pathologist'}
        />
        <PersonnelFooterBlock
          label={personnelDisplay.medTech.primaryLine}
          primaryLine={personnelDisplay.medTech.licenseNo ?? ''}
          secondaryLine={'Medical Technologist'}
          textAlign="right"
        />
      </footer>
      <div className="pt-4 mb-0 border-t-2 border-blue-400 text-center">
        <h1
          className="font-bold tracking-[0.35em] text-blue-800 flex items-center justify-center"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: "14px",
          }}
        >
          CURA PERSONALIS
        </h1>
      </div>
    </div>
  );
}

function PatientBlock({ request }: { request: LabRequest }) {
  return (
    <div className="result-patient mt-4 space-y-3 [break-inside:avoid]">
      <div className="grid grid-cols-6 gap-3">
        <PreviewField col={1} label="Patient Code" value={request.patientId} />

        <PreviewField col={2} label="Name" value={request.patientName} />

        <PreviewField col={1} label="Age" value={request.age} />

        <PreviewField col={1} label="Sex" value={request.sex} />

        <PreviewField col={1} label="Date" value={formatDate(new Date())} />
      </div>

      <div className="grid grid-cols-6 gap-3">
        <PreviewField col={3} label="Address" value={request.address} />

        <PreviewField col={3} label="Requested By" value={request.requestedBy} />
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
      <h3 className="result-section-title border-b border-slate-200 pb-2 text-[11px] font-bold tracking-[0.22em] text-slate-600">
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
    <PreviewShell title="HEMATOLOGY" form={form}>
      <PatientBlock request={request} />
      <Section title="">
        <div className="result-table overflow-hidden rounded-2xl border border-slate-700">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-500">
            <div className="px-4 py-2 border-r border-slate-300">
              Test
            </div>

            <div className="px-4 py-2 border-r border-slate-300">
              Result
            </div>

            <div className="px-4 py-2 border-r border-slate-300">
              Unit
            </div>

            <div className="px-4 py-2">
              Normal Values
            </div>
          </div>
          <div className="text-black">
            {[
              {
                label: "Hemoglobin",
                value: getValue(form, "Hemoglobin"),
                unit: "g/L",
                reference: "M: 130-180 g/L",
                reference_2: "F: 120-160 g/L"
              },
              {
                label: "Hematocrit",
                value: getValue(form, "Hematocrit"),
                unit: "L/L",
                reference: "M: 0.40-0.54 L/L",
                reference_2: "F: 0.37-0.47 L/L"
              },
              {
                label: "RBC Count",
                value: getValue(form, "rbc_count"),
                unit: "×10¹²/L",
                reference: "M: 4.5-6.2 × 10¹² L/L",
                reference_2: "F: 0.37-0.47 × 10¹² L/L"
              },
              {
                label: "WBC Count",
                value: getValue(form, "wbc_count"),
                unit: " ×10⁹/L",
                reference: "4.5-10 ×10⁹/L",
              },
              {
                label: "Platelet Count",
                value: getValue(form, "platelet_count"),
                unit: " ×10⁹/L",
                reference: "150-450 ×10⁹/L",
              },
              {
                label: "Others: MCV",
                value: getValue(form, "others_mcv"),
                unit: "fL",
                reference: "82-98 fL",
              },
              {
                label: "MCHC",
                value: getValue(form, "mchc"),
                unit: "g/dL",
                reference: "32-36 g/dL",
              },
              {
                label: "Reticulocyte Count",
                value: getValue(form, "reticulocyte_count"),
                unit: "%",
                reference: "0.5-1.5 %",
              },
              {
                label: "",
                value: "",
                unit: "",
                reference: "",
              },
              {
                label: "DIFFERENTIAL COUNT",
                value: "",
                unit: "",
                reference: "",
                style: 'text-green-900! font-bold'
              },
              {
                label: "Neutrophils",
                value: getValue(form, "nss_1"),
                unit: "%",
                reference: "55-65 %",
              },
              {
                label: "Segmenters",
                value: getValue(form, "nss_2"),
                unit: "%",
                reference: "50-60 %",
              },
              {
                label: "Stab",
                value: getValue(form, "nss_3"),
                unit: "%",
                reference: "0-5 %",
              },
              {
                label: "Lymphocytes",
                value: getValue(form, "lymphocytes"),
                unit: "%",
                reference: "25-35 %",
              },
              {
                label: "Monocytes",
                value: getValue(form, "monocytes"),
                unit: "%",
                reference: "4-8 %",
              },
              {
                label: "Eosinophils",
                value: getValue(form, "eosinophils"),
                unit: "%",
                reference: "1-3 %",
              },
              {
                label: "Basophils",
                value: getValue(form, "basophils"),
                unit: "%",
                reference: "0-1 %",
              },
              {
                label: "Others",
                value: getValue(form, "others1"),
                unit: "",
                reference: "",
              },
              {
                label: "",
                value: "",
                unit: "",
                reference: "",
              },
              {
                label: "Clotting Time (CT)",
                value: "",
                unit: "",
                reference: "3-5 Minutes",
              },
              {
                label: "Bleeding Time (BT)",
                value: "",
                unit: "",
                reference: "1-3 Minutes",
              },
              {
                label: "Others :",
                value: getValue(form, "others2"),
                unit: "",
                reference: "",
                style: 'font-bold border-none'
              },
            ].map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] border-t border-slate-300 text-[12px] text-slate-700"
              >
                <div className={`px-4 border-r border-slate-300 flex items-center py-[.8] ${item.style} ${item.label === '' ? 'py-2' : ''}`}>
                  {item.label.toLocaleUpperCase()}
                </div>

                <div className={`px-4 border-r border-slate-300 flex items-center justify-end ${item.style}`}>
                  {item.value}
                </div>

                <div className={`px-4 border-r border-slate-300 flex items-center justify-end ${item.style}`}>
                  {item.unit}
                </div>
                <div className={`px-4 text-right tabular-nums ${item.style}`}>
                  <div>{item.reference}</div>
                  {item.reference_2 && (
                    <div>{item.reference_2 ?? ''}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <div className="text-blue-500 mt-auto italic font-bold tracking-wide text-center">
        <h2>REMARKS: {getValue(form, "remarks")}</h2>
      </div>
    </PreviewShell>
  );
}

function BloodTypingDocument({ request, form }: Props) {
  return (
    <PreviewShell title="BLOOD TYPING" form={form}>
      <PatientBlock request={request} />

      <Section title="BLOOD TYPE">
        <div className="overflow-hidden rounded-2xl border border-slate-700">

          {/* ABO + RH */}
          <div className="grid grid-cols-2 border-b border-slate-700 text-center">
            <div className="border-r border-slate-700">
              <div className="bg-slate-100 px-4 py-1 text-xs font-bold uppercase border-b border-slate-400 text-slate-700">
                ABO Type
              </div>

              <div className="px-4 py-1 text-center text-sm font-semibold text-slate-700">
                {getValue(form, "abo_type", "____")}
              </div>
            </div>

            <div>
              <div className="bg-slate-100 px-4 py-1 text-xs font-bold uppercase border-b border-slate-400 text-slate-700">
                Rh Type
              </div>

              <div className="px-4 py-1 text-center text-sm font-semibold text-slate-700">
                {getValue(form, "rh_type", "____")}
              </div>
            </div>
          </div>

          {/* Others */}
          <div>
            <div className="bg-slate-100 px-4 py-1 text-xs font-bold uppercase tracking-wider border-b border-slate-400 text-slate-700">
              Others
            </div>

            <div className="px-4 py-2 text-sm text-slate-700 min-h-[10px]">
              {getValue(form, "others2", "No additional remarks")}
            </div>
          </div>

        </div>
      </Section>

      <div className="text-blue-500 mt-auto italic font-bold tracking-wide text-center">
        <h2>
          REMARKS: {getValue(form, "remarks")}
        </h2>
      </div>
    </PreviewShell>
  );
}

function ParasitologyDocument({ request, form }: Props) {
  return (
    <PreviewShell title="PARASITOLOGY" form={form}>
      <PatientBlock request={request} />
      <Section title="MACROSCOPIC EXAMINATION">
        <div className="rounded-xl border border-slate-300 grid grid-cols-[1fr_1fr] overflow-hidden">
          <LabResultRow
            label="Color"
            value={getValue(form, "color", "____")}
          />

          <LabResultRow
            label="Consistency"
            value={getValue(form, "consistency", "____")}
          />

          <LabResultRow
            label="Time Collected"
            value={getValue(form, "time_collected", "____")}
          />

          <LabResultRow
            label="Time Received"
            value={getValue(form, "time_received", "____")}
          />
        </div>
      </Section>
      <Section title="MICROSCOPIC EXAMINATION">
        <div className="overflow-hidden rounded-xl border border-slate-300 grid grid-cols-[1fr_1fr]">
          <LabResultRow
            label="Pus Cells"
            value={getValue(form, "pus_cells", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="RBC"
            value={getValue(form, "rbc", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="Bacteria"
            value={getValue(form, "bacteria", "____")}
            unit="/HPF"
          />
        </div>
      </Section>
      <Section title="PARASITES">
        <div className="overflow-hidden rounded-xl border border-slate-300 grid grid-cols-[1fr_1fr]">
          <LabResultRow
            label="Hookworm"
            value={getValue(form, "hookworm", "____")}
            unit="/smear"
          />

          <LabResultRow
            label="Ascaris"
            value={getValue(form, "ascaris", "____")}
            unit="/smear"
          />

          <LabResultRow
            label="Trichuris"
            value={getValue(form, "trichuris", "____")}
            unit="/smear"
          />

          <LabResultRow
            label="Strongyloides"
            value={getValue(form, "strongloides", "____")}
            unit="/smear"
          />
        </div>
      </Section>
      <Section title="AMOEBA">
        <div className="grid grid-cols-2 gap-6">

          <div className="overflow-hidden rounded-xl border border-slate-300">
            <div className="bg-slate-50 px-4 py-2 text-[12px] font-bold text-slate-700">
              Entamoeba Histolytica
            </div>

            <LabResultRow
              label="Cyst"
              value={getValue(form, "histolytica_cyst", "____")}
              unit="/HPF"
            />

            <LabResultRow
              label="Trophozoite"
              value={getValue(form, "histolytica_trophozoite", "____")}
              unit="/HPF"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-300">
            <div className="bg-slate-50 px-4 py-2 text-[12px] font-bold text-slate-700">
              Entamoeba Coli
            </div>

            <LabResultRow
              label="Cyst"
              value={getValue(form, "coli_cyst", "____")}
              unit="/HPF"
            />

            <LabResultRow
              label="Trophozoite"
              value={getValue(form, "coli_trophozoite", "____")}
              unit="/HPF"
            />
          </div>

        </div>
      </Section>
      <Section title="OTHER FINDINGS">
        <div className="rounded-xl border border-slate-300 overflow-hidden">
          <div className="grid grid-cols-[110px_1fr]">
            <div className="px-4 py-2 font-medium text-slate-700 bg-slate-50">
              Others :
            </div>

            <div className="px-4 py-2 font-medium text-black">
              {getValue(form, "others", "____")}
            </div>
          </div>
        </div>
      </Section>

      <p className="result-remarks mt-auto text-sm font-bold text-blue-600 italic font-bold tracking-wide text-center">
        REMARKS : {getValue(form, "remarks")}
      </p>
    </PreviewShell>
  );
}

function UrinalysisDocument({ request, form }: Props) {
  return (
    <PreviewShell title="URINALYSIS" form={form}>
      <PatientBlock request={request} />
      <Section title="PHYSICAL EXAMINATION">
        <div className="rounded-xl border border-slate-300 grid grid-cols-[1fr_1fr] overflow-hidden">
          <LabResultRow
            label="COLOR"
            value={getValue(form, "color", "____")}
          />

          <LabResultRow
            label="TRANSPARENCY"
            value={getValue(form, "transparency", "____")}
          />
        </div>
      </Section>
      <Section title="CHEMICAL EXAMINATION">
        <div className="result-table overflow-hidden rounded-2xl border border-slate-300">
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-500">
            <div className="px-4 py-2 border-r border-slate-300">
              CHEMICAL TEST
            </div>

            <div className="px-4 py-2 border-r border-slate-300">
              ResultS
            </div>
            <div className="px-4 py-2">
              REFERENCE RANGE
            </div>
          </div>
          {[
            { label: "pH", value: getValue(form, "ph_result"), style: '', unit: '5.0-7.0' },
            { label: "Specific Gravity", value: getValue(form, "spec_grav_result"), style: '', unit: '1-003-1.030' },
          ].map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[1fr_1fr_1fr] text-black border-t border-slate-300 text-[13px]"
            >
              <div className={`px-4 py-1 border-r border-slate-300 text-[12px] font-medium text-slate-700 ${item.style} ${item.label === '' ? 'py-2' : ''}`}>
                {item.label.toLocaleUpperCase()}
              </div>

              <div className={`px-4 py-1 text-right border-r border-slate-300 text-[12px] font-bold text-slate-700 ${item.style}`}>
                {item.value}
              </div>

              <div className={`px-4 py-1 text-center border-r border-slate-300 text-[12px] font-medium text-slate-700 ${item.style}`}>
                {item.unit}
              </div>
            </div>
          ))}
        </div>
        <div className="result-table overflow-hidden rounded-2xl border border-slate-300 grid grid-cols-2 mt-3">
          <div className="border-r border-slate-300">
            <div className="grid grid-cols-[1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-500">
              <div className="px-4 py-2 border-r border-slate-300">
                CHEMICAL TEST
              </div>
              <div className="px-4 py-2">
                RESULTS
              </div>
            </div>
            {[
              { label: "PROTEIN", value: getValue(form, "protein"), style: '' },
              { label: "Glucose", value: getValue(form, "glucose"), style: '' },
              { label: "Others: Leukocytes", value: getValue(form, "leukocytes"), style: '', },
            ].map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[1fr_1fr] text-black border-t border-slate-300 text-[12px]"
              >
                <div className={`px-4 py-1 border-r border-slate-300 text-[12px] font-medium text-slate-700 ${item.style} ${item.label === '' ? 'py-2' : ''}`}>
                  {item.label.toLocaleUpperCase()}
                </div>

                <div className={`px-4 py-1 text-center text-[12px] text-slate-700 font-bold uppercase ${item.style}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="grid grid-cols-[1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-500">
              <div className="px-4 py-2 border-r border-slate-300">
                CHEMICAL TEST
              </div>
              <div className="px-4 py-2">
                RESULTS
              </div>
            </div>
            {[
              { label: "Nitrite", value: getValue(form, "nitrite"), style: '' },
              { label: "Ketones", value: getValue(form, "ketones") },
              { label: "Blood", value: getValue(form, "blood"), style: '', },
            ].map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[1fr_1fr] text-black border-t border-slate-200 text-[13px]"
              >
                <div className={`px-4 py-1 border-r border-slate-300 text-[12px] font-medium text-slate-700 ${item.style} ${item.label === '' ? 'py-2' : ''}`}>
                  {item.label.toLocaleUpperCase()}
                </div>

                <div className={`px-4 py-1 text-center border-r border-slate-300 text-[12px] text-slate-700 font-bold uppercase ${item.style}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section title="MICROSCOPIC EXAMINATION">
        <div className="overflow-hidden rounded-xl border border-slate-300 grid grid-cols-[.7fr_.7fr]">
          <LabResultRow
            label="PUS CELLS"
            value={getValue(form, "pus_cells", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="RBC"
            value={getValue(form, "rbc", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="SQUAMOUS EPITH. CELLS"
            value={getValue(form, "squamous_cell", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="Round Epith. Cells"
            value={getValue(form, "round_cell", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="Bacteria"
            value={getValue(form, "bacteria", "____")}
            unit="/HPF"
          />

          <LabResultRow
            label="Mucous Threads"
            value={getValue(form, "mucous", "____")}
            unit="/HPF"
          />

        </div>
      </Section>
      <Section title="OTHER FINDINGS">
        <div className="rounded-xl border border-slate-300 overflow-hidden">
          <div className="grid grid-cols-[110px_1fr]">
            <div className="px-4 py-2 font-medium text-slate-700 bg-slate-50">
              Others :
            </div>

            <div className="px-4 py-2 font-medium text-black">
              {getValue(form, "others", "____")}
            </div>
          </div>
        </div>
      </Section>

      <div className="text-blue-500 mt-auto italic font-bold tracking-wide text-center uppercase">
        <h2>REMARKS: {getValue(
          form,
          "remarks",
          "No intestinal parasite seen in direct fecal smear"
        )}</h2>
      </div>
    </PreviewShell>
  );
}

function ClinicalChemistryDocument({ request, form, displayMode = "preview" }: Props) {
  const fieldNames = resolveClinicalChemistryFieldNames(request);
  const rows = getClinicalChemistryRows(displayMode === "print" ? undefined : fieldNames);
  const showMealFields = shouldShowClinicalChemistryMealFields(request);
  const rowFallback = displayMode === "print" ? "0" : "____";

  return (
    <PreviewShell title="CLINICAL CHEMISTRY" form={form}>
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <div className="result-table mt-3 overflow-hidden rounded-2xl border border-slate-700">
          <div className="result-table-head grid grid-cols-[.6fr_1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-500">
            <div className="px-4 py-2.5 border-r border-slate-500">
              Phase
            </div>

            <div className="px-4 py-2.5 border-r border-slate-500">
              CONVENTIONAL
            </div>

            <div className="px-4 py-2.5">
              Si
            </div>
          </div>
          <div className="result-table-head grid grid-cols-[.6fr_0.4fr_0.6fr_0.4fr_0.6fr] bg-slate-50 text-center text-[9px] print:text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-200">
            <div className="px-2 py-2.5 border-r border-slate-500"></div>

            <div className="px-2 py-2.5 border-r border-slate-300">
              Result
            </div>

            <div className="px-2 py-2.5 border-r border-slate-500">
              Noramal Values
            </div>

            <div className="px-2 py-2.5 border-r border-slate-300">
              Result
            </div>

            <div className="px-2 py-2.5">
              Noramal Values
            </div>
          </div>
          {rows.map((row, i) => {
            const ref = row.referenceValues?.[0];
            const ref2 = row.referenceValues?.[1];
            return (
              <div
                key={row.fieldName}
                className="result-table-row grid grid-cols-[.6fr_0.4fr_0.6fr_0.4fr_0.6fr] border-t border-slate-500 text-[11px] print:text-[12px] leading-4 text-slate-700"
              >
                <div className="px-2 py-2.5 border-r border-slate-500 text-left ">
                  {row.label}
                </div>

                <div className="px-2 py-2.5 flex items-center justify-end gap-2 tabular-nums border-r border-slate-200">
                  <span className="text-nowrap">{getValue(form, row.fieldName, rowFallback)}</span>
                  <span className="text-slate-700">{row?.label === 'SGPT' ? 'U/L' : 'mg/dL'}</span>
                </div>

                <div className="px-2 py-2.5 flex justify-end gap-2 border-r border-slate-500">
                  {ref?.label && (<div className="text-left tabular-nums">
                    <div > {ref?.label ?? ''}</div>
                    {ref2?.label && (
                      <div>{ref2?.label ?? ''}</div>
                    )}
                  </div>
                  )}
                  <div className="text-right tabular-nums">
                    <div>{ref?.conventional ?? "____"}</div>
                    {ref2 && (
                      <div>{ref2.conventional}</div>
                    )}
                  </div>

                  <div className="text-right tabular-nums ">
                    <div>{row?.label === 'SGPT' ? 'U/L' : 'mg/dL'}</div>
                    {ref2 && (
                      <div>{row?.label === 'SGPT' ? 'U/L' : 'mg/dL'}</div>
                    )}
                  </div>
                </div>

                {/* {****} */}

                <div className="px-2 py-2.5 flex items-center justify-end gap-2 tabular-nums border-r border-slate-200">
                  <span className="text-nowrap">
                    {row.conversionFieldName && row.label !== 'SGPT'
                      ? getValue(form, row.conversionFieldName, rowFallback)
                      : ""}
                  </span>
                  <span className="text-slate-700">{row.label !== 'SGPT' ? 'mmol/L' : ''}</span>
                </div>

                <div className="px-2 py-2.5 flex justify-end gap-2">
                  {ref?.label && (<div className="text-left tabular-nums">
                    <div> {ref?.label && row.label !== 'SGPT' ? ref.label + ' (' + (row.label !== 'SGPT' ? 'mmol/L' : '') + ')' : ''}</div>
                    {ref2?.label && (
                      <div>{ref2?.label && row.label !== 'SGPT' ? ref2.label + ' (' + (row.label !== 'SGPT' ? 'mmol/L' : '') + ')' : ''}</div>
                    )}
                  </div>
                  )}
                  <div className="text-right tabular-nums">
                    <div>{ref?.si ?? "____"}</div>
                    {ref2 && (
                      <div>{ref2.si}</div>
                    )}
                  </div>

                  <div className="text-right tabular-nums ">
                    <div>{row?.label === 'SGPT' ? '' : 'mmol/L'}</div>
                    {ref2 && (
                      <div>{row?.label === 'SGPT' ? '' : ''}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      {
        showMealFields ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PreviewFieldv2 label="Last Meal" value={getValue(form, "last_meal")} />
            <PreviewFieldv2 label="Time Taken" value={getValue(form, "time_taken")} />
          </div>
        ) : null
      }

      <div className="text-blue-500 mt-auto italic font-bold tracking-wide text-center">
        <h2>REMARKS: {getValue(form, "remarks")}</h2>
      </div>
    </PreviewShell >
  );
}

function SingleChemistryDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);
  const config = template.singleChemistry;

  if (!config) {
    return <GenericDocument request={request} form={form} title={template.label.toUpperCase()} />;
  }

  return (
    <PreviewShell title={template.label.toUpperCase()} form={form}>
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
      <p className="result-remarks mt-auto text-sm font-bold text-blue-600 italic font-bold tracking-wide text-center">
        REMARKS : {getValue(form, "remarks")}
      </p>
    </PreviewShell>
  );
}

function SerologyDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);

  return (
    <PreviewShell title= {template.label.toUpperCase()} form={form}>
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          {[
            {
              label: "TEST REQUESTED",
              value: getValue(form, "test", "____"),
            },
            {
              label: "TEST METHOD",
              value: getValue(form, "method", "____"),
            },
            {
              label: "SPECIMEN",
              value: getValue(form, "specimen", "____"),
            },
            ...(template.serology?.showDayOfFever
              ? [{ label: "Day of Fever", value: getValue(form, "day_of_fever") }]
              : []),
          ].map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[180px_1fr] border-t first:border-t-0 border-slate-200 text-[13px]"
            >
              <div className="px-4 py-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200">
                {item.label}
              </div>

              <div className="px-4 py-2 font-semibold text-black">
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <span className="mt-1 block text-xs indent-50 italic text-slate-500">
          {template.serology?.specimenPlaceHolder}
        </span>
      </Section>
      <Section title="RESULT">
        <div className="border border-slate-300 p-2">
          <p className="result-remarks text-sm font-medium text-black px-2">
            {getValue(form, "result", "No result entered")}
          </p>
        </div>
      </Section>
      <p className="result-remarks mt-auto text-sm font-bold text-blue-600 italic font-bold tracking-wide text-center">
        REMARKS : {getValue(form, "remarks")}
      </p>
    </PreviewShell>
  );
}

function FecalOccultBloodDocument({ request, form }: Props) {
  return (
    <PreviewShell title="Clinical Microscopy" subTitle="(Fecal Occult Blood Test)" form={form}>
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          {[
            {
              label: "TEST",
              value: getValue(form, "test", "____"),
            },
            {
              label: "METHOD",
              value: getValue(form, "method", "____"),
            },
            {
              label: "SPECIMEN",
              value: getValue(form, "specimen", "____"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[160px_1fr] border-t first:border-t-0 border-slate-200 text-[13px]"
            >
              <div className="px-4 py-2 bg-slate-50 border-r border-slate-200 font-medium text-slate-700">
                {item.label}
              </div>

              <div className="px-4 py-2 font-semibold text-black">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="TEST RESULT">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          <div className="grid grid-cols-[160px_1fr] text-[14px]">
            <div className="px-4 py-3 bg-slate-50 border-r border-slate-200 font-medium text-slate-700">
              RESULT
            </div>

            <div className="px-4 py-3 text-md font-bold text-black uppercase">
              {getValue(form, "result", "____")}
            </div>
          </div>
        </div>
      </Section>
      <p className="result-remarks mt-auto text-sm font-bold text-blue-600 italic font-bold tracking-wide text-center">
        REMARKS : {getValue(form, "remarks")}
      </p>
    </PreviewShell>
  );
}

function Hba1cDocument({ request, form }: Props) {
  return (
    <PreviewShell title="Clinical Chemistry" subTitle="(HBA1C)" form={form}>
      <PatientBlock request={request} />
      <Section title="TEST DETAILS">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          {[
            {
              label: "TEST REQUESTED",
              value: getValue(form, "test_requested", "____"),
            },
            {
              label: "TEST METHOD",
              value: getValue(form, "test_method", "____"),
            },
            {
              label: "LOT NUMBER",
              value: getValue(form, "lot_no", "____"),
            },
            {
              label: "EXPIRATION DATE",
              value: getValue(form, "exp_date", "____"),
            },
            {
              label: "SPECIMEN",
              value: getValue(form, "specimen", "____"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[180px_1fr] border-t first:border-t-0 border-slate-200 text-[13px]"
            >
              <div className="px-4 py-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200">
                {item.label}
              </div>

              <div className="px-4 py-2 font-semibold text-black">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="TEST RESULT">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          <div className="grid grid-cols-[180px_1fr] text-[14px]">
            <div className="px-4 py-3 bg-slate-50 border-r border-slate-200 font-medium text-slate-700">
              HbA1c RESULT
            </div>

            <div className="px-4 py-3 font-bold text-black text-lg">
              {getValue(form, "result", "____")} %
            </div>
          </div>
        </div>
      </Section>
      <Section title="INTERPRETATION OF RESULTS">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          <div className="grid grid-cols-[1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-300">
            <div className="px-4 py-2 border-r border-slate-300">
              Category
            </div>

            <div className="px-4 py-2">
              Reference Range
            </div>
          </div>

          {[
            {
              label: "Normal",
              value: getValue(form, "normal", "____"),
            },
            {
              label: "Pre-Diabetes",
              value: getValue(form, "pre_diabetes", "____"),
            },
            {
              label: "Diabetes",
              value: getValue(form, "diabetes", "____"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[1fr_1fr] border-t border-slate-200 text-[13px]"
            >
              <div className="px-4 py-2 border-r border-slate-200 font-medium text-slate-700">
                {item.label}
              </div>

              <div className="px-4 py-2 text-center font-semibold text-black">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <p className="result-remarks mt-auto text-sm font-bold text-blue-600 italic font-bold tracking-wide text-center">
        REMARKS : {getValue(form, "remarks", "No additional remarks")}
      </p>
    </PreviewShell>
  );
}

function ChemistryPanelDocument({ request, form, displayMode = "preview" }: Props) {
  const fieldNames = resolveChemistryPanelFieldNames(request);
  const rows = getChemistryPanelRows(displayMode === "print" ? undefined : fieldNames);
  const valueFallback = displayMode === "print" ? "0" : "__________________";

  return (
    <PreviewShell title="CHEMISTRY" form={form}>
      <PatientBlock request={request} />
      <Section title="TEST RESULTS">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-300">
            <div className="px-4 py-2 border-r border-slate-300">
              Test
            </div>
            <div className="px-4 py-2 border-r border-slate-300" >
              Result
            </div>
            <div className="px-4 py-2 border-r border-slate-300" >
              Unit
            </div>
            <div className="px-4 py-2">
              Normal values
            </div>
          </div>

          {rows.filter((row) => row.fieldName !== "ionized_calcium_conv").map((row) => (
            <div
              key={row.fieldName}
              className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-slate-200 text-[13px]"
            >
              <div className="px-4 py-2 border-r border-slate-200 font-medium text-slate-700 flex items-center">
                {row.label}
              </div>

              <div className="px-4 py-2 border-r border-slate-200 text-center font-semibold text-black">
                {row.label === "Ionized Calcium" ? (
                  <>
                    <div className="py-1">{getValue(form, "ionized_calcium", valueFallback)}</div>
                    <div className="py-1">{getValue(form, "ionized_conv", valueFallback)}</div>
                  </>
                ) : (
                  getValue(form, row.fieldName, valueFallback)
                )}
              </div>
              <div className="px-4 py-2 border-r border-slate-200 font-medium text-center text-slate-700 tabular-nums">
                {row.label === "Ionized Calcium" ? (
                  <>
                    <div className="py-1">{row.unit}</div>
                    <div className="py-1">mg/dL</div>
                  </>
                ) : (
                  <div>{row.unit}</div>
                )}
              </div>
              <div className="px-4 py-2 border-r border-slate-200 font-medium text-center text-slate-700">
                {row.label === "Ionized Calcium" ? (
                  <>
                    <div className="py-1">{row.referenceValues}</div>
                    <div className="py-1">4.4-5.4</div>
                  </>
                ) : (
                  <div>{row.referenceValues}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="OTHERS">
        <div className="rounded-xl border border-slate-300 overflow-hidden">
          <div className="grid grid-cols-[180px_1fr]">
            <div className="px-4 py-2 font-medium text-slate-700 bg-slate-50">
              Others
            </div>

            <div className="px-4 py-2 font-medium text-black">
              {getValue(form, "others", "____")}
            </div>
          </div>
        </div>
      </Section>
      <p className="result-remarks mt-auto text-sm font-bold text-blue-600 italic font-bold tracking-wide text-center">
        REMARKS : {getValue(form, "remarks", "No additional remarks")}
      </p>
    </PreviewShell>
  );
}

function OgttDocument({ request, form }: Props) {
  const template = resolveLabTemplate(request);
  const phases = template.ogtt?.phases ?? [];
  const references = template.ogtt?.referenceValues ?? [];
  let subTitle = "";
  let testRequest = "";
  let glucoseLevel = "";
  let description = "";

  switch (template.label) {
    case "75G-OGTTv2":
      subTitle = "2H-OGTT";
      testRequest = "75 GRAMS 2H-OGTT BIOCHEMICAL DIAGNOSIS OF GESTATIONAL DIABETES MELLITUS";
      glucoseLevel = "75 Grams";
      description = 'Presence of one or more glucose values equals to or exceeding glucose concentration threshold qualities for the biochemical diagnosis of Gestational Diabetes Mellitus.';
      break;

    case "75G-OGTT":
      subTitle = "2H-OGTT";
      testRequest = "75 GRAMS 2H-OGTT BIOCHEMICAL DIAGNOSIS OF NON–GESTATIONAL DIABETES MELLITUS";
      glucoseLevel = "75 Grams";
      description = 'Presence of one or more glucose values equals to or exceeding glucose concentration threshold qualities for the biochemical diagnosis of Non–Gestational Diabetes Mellitus.';
      break;

    case "50G-OGTT":
      subTitle = "1H-OGTT";
      testRequest = "50 GRAMS 1H-OGTT BIOCHEMICAL DIAGNOSIS OF GESTATIONAL DIABETES MELLITUS";
      glucoseLevel = "50 Grams";
      description = 'Presence of one or more glucose values equals to or exceeding glucose concentration threshold qualities for the biochemical diagnosis of Gestational Diabetes Mellitus.';
      break;

    case "100G-OGTT":
      subTitle = "OGTT";
      testRequest = "100 GRAMS OGTT BIOCHEMICAL DIAGNOSIS OF GESTATIONAL DIABETES MELLITUS";
      glucoseLevel = "100 Grams";
      description = 'Presence of one or more glucose values equals to or exceeding glucose concentration threshold qualities for the biochemical diagnosis of Gestational Diabetes Mellitus.';
      break;
  }

  return (
    <PreviewShell title={template.apiCategory.toUpperCase()} subTitle={subTitle} form={form}>
      <PatientBlock request={request} />

      <Section title="TEST DETAILS">
        <div className="overflow-hidden rounded-xl border border-slate-500">
          {[
            {
              label: "TEST REQUEST",
              value: testRequest,
            },
            {
              label: "GLUCOSE LEVEL",
              value: glucoseLevel,
            },
            {
              label: "SPECIMEN",
              value: "SERUM",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[140px_1fr] border-t first:border-t-0 border-slate-500 text-[13px]"
            >
              <div className="px-4 py-2 bg-slate-50 border-r border-slate-500 font-medium text-slate-700">
                {item.label}
              </div>

              <div className="px-4 py-2 font-semibold text-slate-700 tracking-tight">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="TEST RESULTS">
        <div className="result-table overflow-hidden rounded-2xl border border-slate-500">
          <div className="result-table-head grid grid-cols-[.90fr_1fr_1fr] bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 border-b border-slate-500">
            <div className="px-4 py-2.5 border-r border-slate-500">
              Phase
            </div>

            <div className="px-4 py-2.5 border-r border-slate-500">
              Result
            </div>

            <div className="px-4 py-2.5">
              Glucose Conc. Threshold
            </div>
          </div>
          <div className="result-table-head grid grid-cols-[.90fr_0.5fr_0.5fr_0.5fr_0.5fr] bg-slate-50 text-center text-[9px] print:text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-200">
            <div className="px-4 py-2.5 border-r border-slate-500"></div>

            <div className="px-4 py-2.5 border-r border-slate-300">
              Conventional
            </div>

            <div className="px-4 py-2.5 border-r border-slate-500">
              SI
            </div>

            <div className="px-4 py-2.5 border-r border-slate-300">
              Conventional
            </div>

            <div className="px-4 py-2.5">
              SI
            </div>
          </div>
          {phases.map((phase, i) => {
            const ref = references[i];

            return (
              <div
                key={phase.fieldName}
                className="result-table-row grid grid-cols-[.90fr_0.5fr_0.5fr_0.5fr_0.5fr] border-t border-slate-500 text-[13px] leading-4 text-slate-700"
              >
                <div className="px-4 py-2.5 border-r border-slate-500 text-left">
                  {phase.label}
                </div>

                <div className="px-4 py-2.5 flex items-center justify-end gap-2 tabular-nums">
                  <span> {getValue(form, phase.fieldName, "____")}</span>
                  <span className="text-slate-700">mg/dL</span>
                </div>

                <div className="px-4 py-2.5 flex items-center justify-end gap-2 tabular-nums border-r border-slate-500">
                  <span>{getValue(form, phase.conversionFieldName, "____")}</span>
                  <span className="text-slate-700">mmol/L</span>
                </div>

                <div className="px-4 py-2.5 flex items-center justify-end gap-2 tabular-nums">
                  <span> {ref?.conventional ?? "____"}</span>
                  <span className="text-slate-700">mg/dL</span>
                </div>

                <div className="px-4 py-2.5 flex items-center justify-end gap-2 tabular-nums">
                  <span className="">{ref?.si ?? "____"}</span>
                  <span className="text-slate-700">mmol/L</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="INTERPRETATION">
        <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[13px] leading-6 text-slate-800">
          <span className="font-semibold">Interpretation:</span>{" "}
          {description}
        </div>
      </Section>

      <div className="text-blue-500 mt-auto italic font-bold tracking-wide text-center">
        <h2>REMARKS: {getValue(form, 'remarks', "____")}</h2>
      </div>
    </PreviewShell>
  );
}

function GenericDocument({
  request,
  form,
  title,
}: Props & { title: string }) {
  const rows = Object.entries(form).filter(
    ([key, value]) => !isLabResultMetaField(key) && hasDisplayableLabResultValue(value)
  );

  return (
    <PreviewShell title={title} form={form}>
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

export default function LabResultDocument({
  request,
  form,
  displayMode = "preview",
}: Props) {
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
    return <ClinicalChemistryDocument request={request} form={form} displayMode={displayMode} />;
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
    return <ChemistryPanelDocument request={request} form={form} displayMode={displayMode} />;
  }

  if (template.key === "ogtt") {
    return <OgttDocument request={request} form={form} />;
  }

  return <GenericDocument request={request} form={form} title={request.testType.toUpperCase()} />;
}
