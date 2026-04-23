"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  urinalysisDefaultValues,
  urinalysisSchema,
  UrinalysisFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  initialValues?: LabResultPayload | null;
  onSubmit: (form: UrinalysisFormValues) => void;
  onCancel: () => void;
};

const sectionFields = {
  physical: [
    { label: "Color", name: "color" },
    { label: "Transparency", name: "transparency" },
  ],
  chemical: [
    { label: "pH", name: "ph_result" },
    { label: "Specific Gravity", name: "spec_grav_result" },
    { label: "Protein", name: "protein" },
    { label: "Nitrite", name: "nitrite" },
    { label: "Glucose", name: "glucose" },
    { label: "Ketones", name: "ketones" },
    { label: "Leukocytes", name: "leukocytes" },
    { label: "Blood", name: "blood" },
  ],
  microscopic: [
    { label: "Pus Cells", name: "pus_cells" },
    { label: "RBC", name: "rbc" },
    { label: "Bacteria", name: "bacteria" },
    { label: "Squamous Cell", name: "squamous_cell" },
    { label: "Round Cell", name: "round_cell" },
    { label: "Mucous", name: "mucous" },
    { label: "Crystals", name: "crystals" },
    { label: "Casts", name: "casts" },
  ],
} as const;

export default function UrinalysisModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrinalysisFormValues>({
    resolver: zodResolver(urinalysisSchema),
    defaultValues: mergeLabFormDefaults(urinalysisDefaultValues, initialValues),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Physical Examination
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {sectionFields.physical.map(({ label, name }) => (
            <Input
              key={name}
              label={label}
              placeholder="--"
              {...register(name)}
              error={errors[name]?.message}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Chemical Examination
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {sectionFields.chemical.map(({ label, name }) => (
            <Input
              key={name}
              label={label}
              placeholder="--"
              {...register(name)}
              error={errors[name]?.message}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Microscopic Examination
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {sectionFields.microscopic.map(({ label, name }) => (
            <Input
              key={name}
              label={label}
              placeholder="--"
              {...register(name)}
              error={errors[name]?.message}
            />
          ))}
        </div>
      </div>

      <Input
        label="Others"
        placeholder="Additional findings"
        {...register("others")}
        error={errors.others?.message}
      />

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Results</Button>
      </div>
    </form>
  );
}
