"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ogttDefaultValues,
  OgttFormValues,
  ogttSchema,
} from "@/schemas/lab.schema";

type Props = {
  initialValues?: Partial<OgttFormValues> | null;
  onSubmit: (form: OgttFormValues) => void;
  onCancel: () => void;
};

const testRows: { label: string; name: string; convName?: string }[] = [
  { label: "FBS (Fasting Blood Sugar)", name: "FBS", convName: "FBS_conv" },
  { label: "1 Hour After Glucose Load", name: "onehagl", convName: "onehagl_conv" },
  { label: "2 Hours After Glucose Load", name: "twohagl", convName: "twohagl_conv" },
  { label: "3 Hours After Glucose Load", name: "threehagl", convName: "threehagl_conv" },
];

export default function OGTTResultModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OgttFormValues>({
    resolver: zodResolver(ogttSchema),
    defaultValues: {
      ...ogttDefaultValues,
      ...(initialValues ?? {}),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 space-y-5"
    >
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1">
          <Input
            label="Test Type"
            placeholder="e.g. OGTT / 75G"
            {...register("test_type")}
            error={errors.test_type?.message}
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
              <Input
                placeholder="--"
                className="mx-1"
                {...register(row.name as keyof OgttFormValues)}
                error={errors[row.name as keyof OgttFormValues]?.message}
              />
              <Input
                placeholder="--"
                className="mx-1"
                {...register(row.convName as keyof OgttFormValues)}
                error={errors[row.convName as keyof OgttFormValues]?.message}
              />
            </div>
          ))}
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
