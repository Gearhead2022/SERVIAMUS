"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const testRows: { label: string; name: string; convName?: string }[] = [
  { label: "FBS (Fasting Blood Sugar)", name: "FBS", convName: "FBS_conv" },
  { label: "RBS (Random Blood Sugar)", name: "RBS", convName: "RBS_conv" },
  { label: "BUN (Blood Urea Nitrogen)", name: "BUN", convName: "BUN_conv" },
  { label: "Creatinine", name: "creatinine", convName: "creatinine_conv" },
  { label: "Uric Acid", name: "uric_acid", convName: "uric_acid_conv" },
  { label: "Total Cholesterol", name: "cholesterol", convName: "cholesterol_conv" },
  { label: "HDL Cholesterol", name: "hdl_cholesterol", convName: "hdl_cholesterol_conv" },
  { label: "LDL Cholesterol", name: "ldl_cholesterol", convName: "ldl_cholesterol_conv" },
  { label: "Triglycerides", name: "triglycerides", convName: "triglycerides_conv" },
  { label: "SGPT", name: "sgpt" },
];

const initialForm: Record<string, string> = {
  FBS: "", FBS_conv: "",
  RBS: "", RBS_conv: "",
  BUN: "", BUN_conv: "",
  creatinine: "", creatinine_conv: "",
  uric_acid: "", uric_acid_conv: "",
  cholesterol: "", cholesterol_conv: "",
  hdl_cholesterol: "", hdl_cholesterol_conv: "",
  ldl_cholesterol: "", ldl_cholesterol_conv: "",
  triglycerides: "", triglycerides_conv: "",
  sgpt: "",
  last_meal: "",
  time_taken: "",
};

export default function ClinicalChemistryModal({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="p-5 space-y-5"
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Clinical Chemistry
          </h6>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_6.5rem_6.5rem] text-xs font-semibold text-slate-400 bg-slate-50 px-4 py-2 border-b border-slate-200">
            <span>Test</span>
            <span className="text-center">Result</span>
            <span className="text-center">Conv.</span>
          </div>

          {testRows.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center px-4 py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-sm text-slate-700">{row.label}</span>
              <input
                type="text"
                name={row.name}
                value={form[row.name]}
                onChange={set}
                placeholder="—"
                className="mx-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
              />
              {row.convName ? (
                <input
                  type="text"
                  name={row.convName}
                  value={form[row.convName]}
                  onChange={set}
                  placeholder="—"
                  className="mx-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
                />
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Last Meal", name: "last_meal", placeholder: "e.g. 6 hours ago" },
          { label: "Time Taken", name: "time_taken", placeholder: "e.g. 08:30 AM" },
        ].map(({ label, name, placeholder }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={set}
              placeholder={placeholder}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-[#152859] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c3570]"
        >
          Save Results
        </button>
      </div>
    </form>
  );
}
