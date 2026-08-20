"use client";

import Input from "@/components/ui/Input";

type Props = {
  labNumber: string;
  onLabNumberChange: (value: string) => void;
};

export default function LabResultReferencePanel({
  labNumber,
  onLabNumberChange,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-[#f7f8fc] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
        <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
          Laboratory reference
        </h6>
      </div>
      <Input
        label="Lab No."
        value={labNumber}
        onChange={(event) => onLabNumberChange(event.target.value)}
        placeholder="Enter laboratory number"
        maxLength={80}
        autoComplete="off"
      />
    </section>
  );
}
