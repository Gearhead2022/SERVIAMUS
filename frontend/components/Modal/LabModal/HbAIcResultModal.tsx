"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import {
  hbA1cDefaultValues,
  HbA1cFormValues,
  hbA1cSchema,
} from "@/schemas/lab.schema";

type Props = {
  initialValues?: Partial<HbA1cFormValues> | null;
  onSubmit: (form: HbA1cFormValues) => void;
  onCancel: () => void;
};

export default function HbAIcResultModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HbA1cFormValues>({
    resolver: zodResolver(hbA1cSchema),
    defaultValues: {
      ...hbA1cDefaultValues,
      ...(initialValues ?? {}),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 space-y-5"
    >
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {[
          { label: "Test Method", name: "test_method", type: "text" },
          { label: "Lot No.", name: "lot_no", type: "text" },
          { label: "Expiration Date", name: "exp_date", type: "date" },
          { label: "Specimen", name: "specimen", type: "text" },
          { label: "HbA1c Result", name: "result", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name} className="flex flex-col gap-1">
            <Input
              label={label}
              type={type}
              {...register(name as keyof HbA1cFormValues)}
              error={errors[name as keyof HbA1cFormValues]?.message}
            />
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-1">
          <Textarea
            label="Interpretation"
            rows={4}
            {...register("result_interpretation")}
            error={errors.result_interpretation?.message}
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
