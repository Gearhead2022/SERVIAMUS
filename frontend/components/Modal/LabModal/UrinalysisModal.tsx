"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  urinalysisDefaultValues,
  UrinalysisFormValues,
  urinalysisSchema,
} from "@/schemas/lab.schema";

type Props = {
  initialValues?: Partial<UrinalysisFormValues> | null;
  onSubmit: (form: UrinalysisFormValues) => void;
  onCancel: () => void;
};

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
    defaultValues: {
      ...urinalysisDefaultValues,
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
              <Input
                label={label}
                {...register(name as keyof UrinalysisFormValues)}
                error={errors[name as keyof UrinalysisFormValues]?.message}
              />
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
              <Input
                label={label}
                {...register(name as keyof UrinalysisFormValues)}
                error={errors[name as keyof UrinalysisFormValues]?.message}
              />
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
              <Input
                label={label}
                {...register(name as keyof UrinalysisFormValues)}
                error={errors[name as keyof UrinalysisFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          label="Others"
          placeholder="Additional findings"
          {...register("others")}
          error={errors.others?.message}
        />
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
