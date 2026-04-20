"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  createSerologySchema,
  serologyDefaultValues,
  SerologyFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  config?: {
    defaultMethod?: string;
    defaultSpecimen?: string;
    defaultTestName?: string;
    lockedFields?: Array<"method" | "specimen" | "test">;
    requireDayOfFever?: boolean;
    resultLabel?: string;
    resultPlaceholder?: string;
    showDayOfFever?: boolean;
  };
  initialValues?: LabResultPayload | null;
  onSubmit: (form: SerologyFormValues) => void;
  onCancel: () => void;
};

export default function SerologyResultModal({
  config,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const schema = useMemo(
    () =>
      createSerologySchema({
        requireDayOfFever: config?.requireDayOfFever,
      }),
    [config?.requireDayOfFever]
  );

  const defaultValues = useMemo(
    () =>
      mergeLabFormDefaults(serologyDefaultValues, {
        method: config?.defaultMethod ?? "",
        specimen: config?.defaultSpecimen ?? "",
        test: config?.defaultTestName ?? "",
        ...(initialValues ?? {}),
      }),
    [config, initialValues]
  );

  const lockedFields = new Set(config?.lockedFields ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SerologyFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Test Details
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Input
            label="Test"
            placeholder="Enter serology test"
            readOnly={lockedFields.has("test")}
            {...register("test")}
            error={errors.test?.message}
          />
          <Input
            label="Method"
            placeholder="Enter method used"
            readOnly={lockedFields.has("method")}
            {...register("method")}
            error={errors.method?.message}
          />
          <Input
            label="Specimen"
            placeholder="Enter specimen"
            readOnly={lockedFields.has("specimen")}
            {...register("specimen")}
            error={errors.specimen?.message}
          />
          {config?.showDayOfFever ? (
            <Input
              label="Day of Fever"
              placeholder="Enter day of fever"
              {...register("day_of_fever")}
              error={errors.day_of_fever?.message}
            />
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Result
          </h6>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Input
            label={config?.resultLabel ?? "Result"}
            placeholder={config?.resultPlaceholder ?? "Enter result"}
            {...register("result")}
            error={errors.result?.message}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Results</Button>
      </div>
    </form>
  );
}
