"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import {
  chemistryDefaultValues,
  ChemistryFormValues,
  chemistrySchema,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  initialValues?: LabResultPayload | null;
  onSubmit: (form: ChemistryFormValues) => void;
  onCancel: () => void;
};

export default function ChemistryResultModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChemistryFormValues>({
    resolver: zodResolver(chemistrySchema),
    defaultValues: mergeLabFormDefaults(chemistryDefaultValues, initialValues),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
            <Input
              label={label}
              placeholder="--"
              inputMode="decimal"
              {...register(name as keyof ChemistryFormValues, {
                valueAsNumber: true,
              })}
              error={errors[name as keyof ChemistryFormValues]?.message}
            />
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-1">
          <Textarea
            label="Others"
            rows={4}
            {...register("others")}
            error={errors.others?.message}
          />
        </div>
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
