"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  clinicalChemistryDefaultValues,
  ClinicalChemistryFormValues,
  clinicalChemistrySchema,
} from "@/schemas/lab.schema";

type Props = {
  initialValues?: Partial<ClinicalChemistryFormValues> | null;
  onSubmit: (form: ClinicalChemistryFormValues) => void;
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

export default function ClinicalChemistryModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalChemistryFormValues>({
    resolver: zodResolver(clinicalChemistrySchema),
    defaultValues: {
      ...clinicalChemistryDefaultValues,
      ...(initialValues ?? {}),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
              <Input
                placeholder="-"
                className="mx-1"
                {...register(row.name as keyof ClinicalChemistryFormValues)}
                error={errors[row.name as keyof ClinicalChemistryFormValues]?.message}
              />
              {row.convName ? (
                <Input
                  placeholder="-"
                  className="mx-1"
                  {...register(row.convName as keyof ClinicalChemistryFormValues)}
                  error={errors[row.convName as keyof ClinicalChemistryFormValues]?.message}
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
            <Input
              label={label}
              placeholder={placeholder}
              {...register(name as keyof ClinicalChemistryFormValues)}
              error={errors[name as keyof ClinicalChemistryFormValues]?.message}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Results
        </Button>
      </div>
    </form>
  );
}
