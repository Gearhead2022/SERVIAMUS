"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const initialForm: Record<string, string> = {
  Hemoglobin: "",
  rbc_count: "",
  wbc_count: "",
  platelet_count: "",
  others_mcv: "",
  mchc: "",
  reticulocyte_count: "",
  nss_1: "",
  nss_2: "",
  nss_3: "",
  lymphocytes: "",
  monocytes: "",
  eosinophils: "",
  basophils: "",
  others1: "",
  clotting_time: "",
  bleeding_time: "",
  abo_type: "",
  rh_type: "",
  others2: "",
};

export default function HematologyModal({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">CBC</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Hemoglobin", name: "Hemoglobin" },
            { label: "RBC Count", name: "rbc_count" },
            { label: "WBC Count", name: "wbc_count" },
            { label: "Platelet Count", name: "platelet_count" },
            { label: "MCV", name: "others_mcv" },
            { label: "MCHC", name: "mchc" },
            { label: "Reticulocyte Count", name: "reticulocyte_count" },
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
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Differential Count
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Neutrophils (Seg)", name: "nss_1" },
            { label: "Neutrophils (Stab)", name: "nss_2" },
            { label: "NSS 3", name: "nss_3" },
            { label: "Lymphocytes", name: "lymphocytes" },
            { label: "Monocytes", name: "monocytes" },
            { label: "Eosinophils", name: "eosinophils" },
            { label: "Basophils", name: "basophils" },
            { label: "Others", name: "others1" },
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
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Clotting Studies
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Clotting Time", name: "clotting_time" },
            { label: "Bleeding Time", name: "bleeding_time" },
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
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Blood Typing
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">ABO Type</label>
            <select
              name="abo_type"
              value={form.abo_type}
              onChange={set}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Rh Type</label>
            <select
              name="rh_type"
              value={form.rh_type}
              onChange={set}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
            >
              <option value="">Select...</option>
              <option value="Positive">Positive (+)</option>
              <option value="Negative">Negative (−)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Others</label>
        {fieldInput("others2", "Additional notes")}
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
