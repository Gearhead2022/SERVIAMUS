"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  serologyDefaultValues,
  SerologyFormValues,
  serologySchema,
} from "@/schemas/lab.schema";

type Props = {
  initialValues?: Partial<SerologyFormValues> | null;
  onSubmit: (form: SerologyFormValues) => void;
  onCancel: () => void;
};

export default function SerologyModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SerologyFormValues>({
    resolver: zodResolver(serologySchema),
    defaultValues: {
      ...serologyDefaultValues,
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
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">General</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Test", name: "test" },
            { label: "Method", name: "method" },
            { label: "Specimen", name: "specimen" },
            { label: "Day of Fever", name: "day_of_fever" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof SerologyFormValues)}
                error={errors[name as keyof SerologyFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-#23324a-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Result
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Result", name: "result" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof SerologyFormValues)}
                error={errors[name as keyof SerologyFormValues]?.message}
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
