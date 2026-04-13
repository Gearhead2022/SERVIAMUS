"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const initialForm: Record<string, string> = {
  sodium: "",
  potassium: "",
  chloride: "",
  ionized_calcium: "",
  others: "",
};

export default function ChemistryResultModal({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="p-5 space-y-5"
    >
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {[
          { label: "Sodium", name: "sodium" },
          { label: "Potassium", name: "potassium" },
          { label: "Chloride", name: "chloride" },
          { label: "Ionized Calcium", name: "ionized_calcium" },
        ].map(({ label, name }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <input
              type="text"
              name={name}
              value={form[name]}
              onChange={set}
              placeholder="--"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
            />
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Others</label>
          <textarea
            name="others"
            value={form.others}
            onChange={set}
            rows={4}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
          />
        </div>
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
