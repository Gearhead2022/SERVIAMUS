"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const initialForm: Record<string, string> = {
  color: "",
  transparency: "",
  ph_result: "",
  spec_grav_result: "",
  protein: "",
  nitrite: "",
  glucose: "",
  ketones: "",
  leukocytes: "",
  blood: "",
  pus_cells: "",
  rbc: "",
  bacteria: "",
  squamous_cell: "",
  round_cell: "",
  mucous: "",
  crystals: "",
  casts: "",
  others: "",
};

export default function UrinalysisModal({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const fieldInput = (name: string, placeholder = "—") => (
    <input
      type="text"
      name={name}
      value={form[name]}
      onChange={set}
      placeholder={placeholder}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-#151c47-500 focus:outline-none focus:ring-1 focus:ring-#151c47-200"
    />
  );

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
          <div className="h-4 w-1 shrink-0 rounded-full bg-#151c47-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-#151c47-700">
            Physical Examination
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Color", name: "color" },
            { label: "Transparency", name: "transparency" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{label}</label>
              {fieldInput(name)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-#151c47-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-#151c47-700">
            Chemical Examination
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "pH", name: "ph_result" },
            { label: "Specific Gravity", name: "spec_grav_result" },
            { label: "Protein", name: "protein" },
            { label: "Nitrite", name: "nitrite" },
            { label: "Glucose", name: "glucose" },
            { label: "Ketones", name: "ketones" },
            { label: "Leukocytes", name: "leukocytes" },
            { label: "Blood", name: "blood" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{label}</label>
              {fieldInput(name)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-#151c47-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-#151c47-700">
            Microscopic Examination
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Pus Cells", name: "pus_cells" },
            { label: "RBC", name: "rbc" },
            { label: "Bacteria", name: "bacteria" },
            { label: "Squamous Cell", name: "squamous_cell" },
            { label: "Round Cell", name: "round_cell" },
            { label: "Mucous", name: "mucous" },
            { label: "Crystals", name: "crystals" },
            { label: "Casts", name: "casts" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{label}</label>
              {fieldInput(name)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Others</label>
        {fieldInput("others", "Additional findings")}
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
