"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const initialForm: Record<string, string> = {
  time_collected: "",
  time_recieved: "",
  color: "",
  consistency: "",
  pus_cells: "",
  rbc: "",
  bacteria: "",
  hookworm: "",
  ascaris: "",
  trichuris: "",
  strongloides: "",
  histolytica_cyst: "",
  histolytica_trophozoite: "",
  coli_cyst: "",
  coli_trophozoite: "",
  others: "",
};

export default function ParasitologyModal({ onSubmit, onCancel }: Props) {
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
      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
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
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">General</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Time Collected", name: "time_collected" },
            { label: "Time Received", name: "time_recieved" },
            { label: "Color", name: "color" },
            { label: "Consistency", name: "consistency" },
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
          <div className="h-4 w-1 shrink-0 rounded-full bg-#23324a-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Microscopic Findings
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Pus Cells", name: "pus_cells" },
            { label: "RBC", name: "rbc" },
            { label: "Bacteria", name: "bacteria" },
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
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">Parasites</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Hookworm", name: "hookworm" },
            { label: "Ascaris", name: "ascaris" },
            { label: "Trichuris", name: "trichuris" },
            { label: "Strongyloides", name: "strongloides" },
            { label: "E. Histolytica (Cyst)", name: "histolytica_cyst" },
            { label: "E. Histolytica (Trophozoite)", name: "histolytica_trophozoite" },
            { label: "E. Coli (Cyst)", name: "coli_cyst" },
            { label: "E. Coli (Trophozoite)", name: "coli_trophozoite" },
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
