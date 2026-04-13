"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const testRows: { label: string; name: string; convName?: string }[] = [
  { label: "FBS (Fasting Blood Sugar)", name: "FBS", convName: "FBS_conv" },
  { label: "1 Hour After Glucose Load", name: "onehagl", convName: "onehagl_conv" },
  { label: "2 Hours After Glucose Load", name: "twohagl", convName: "twohagl_conv" },
  { label: "3 Hours After Glucose Load", name: "threehagl", convName: "threehagl_conv" },
];

const initialForm: Record<string, string> = {
  test_type: "OGTT",
  FBS: "",
  FBS_conv: "",
  onehagl: "",
  onehagl_conv: "",
  twohagl: "",
  twohagl_conv: "",
  threehagl: "",
  threehagl_conv: "",
};

export default function OGTTResultModal({ onSubmit, onCancel }: Props) {
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
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Test Type</label>
          <input
            type="text"
            name="test_type"
            value={form.test_type}
            onChange={set}
            placeholder="e.g. OGTT / 75G"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Oral Glucose Tolerance Test
          </h6>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_6.5rem_6.5rem] border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400">
            <span>Phase</span>
            <span className="text-center">Result</span>
            <span className="text-center">Conv.</span>
          </div>

          {testRows.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center border-b border-slate-100 px-4 py-2 last:border-0"
            >
              <span className="text-sm text-slate-700">{row.label}</span>
              <input
                type="text"
                name={row.name}
                value={form[row.name]}
                onChange={set}
                placeholder="--"
                className="mx-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
              />
              <input
                type="text"
                name={row.convName}
                value={form[row.convName ?? ""]}
                onChange={set}
                placeholder="--"
                className="mx-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-200"
              />
            </div>
          ))}
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
