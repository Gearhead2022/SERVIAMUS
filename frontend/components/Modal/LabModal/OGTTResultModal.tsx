"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  createOgttSchema,
  getOgttDefaultValues,
  OgttFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  config: {
    defaultTestType: string;
    phases: Array<{
      conversionFieldName: string;
      fieldName: string;
      label: string;
    }>;
  };
  initialValues?: LabResultPayload | null;
  onSubmit: (form: OgttFormValues) => void;
  onCancel: () => void;
};

const calculateOgttConversion = (value: number) => Math.round(value * 0.055 * 100) / 100;

export default function OGTTResultModal({
  config,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const schema = useMemo(() => createOgttSchema({ phases: config.phases }), [config.phases]);
  const defaultValues = useMemo(
    () =>
      mergeLabFormDefaults(
        getOgttDefaultValues({
          defaultTestType: config.defaultTestType,
          phases: config.phases,
        }),
        initialValues
      ),
    [config.defaultTestType, config.phases, initialValues]
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const watchedPhaseValues = useWatch({
    control,
    name: config.phases.map((phase) => phase.fieldName),
  });

  useEffect(() => {
    config.phases.forEach((phase, index) => {
      const currentValue = watchedPhaseValues[index];
      const numericValue =
        typeof currentValue === "number" ? currentValue : Number(currentValue);

      if (!Number.isFinite(numericValue)) {
        return;
      }

      setValue(phase.conversionFieldName, calculateOgttConversion(numericValue), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });
  }, [config.phases, setValue, watchedPhaseValues]);

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values as OgttFormValues))}
      className="space-y-5 p-5"
    >
      <div className="grid grid-cols-1 gap-3">
        <Input
          label="Test Type"
          placeholder="e.g. OGTT / 75G"
          {...register("test_type")}
          error={errors.test_type?.message as string | undefined}
        />
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

          {config.phases.map((phase) => (
            <div
              key={phase.fieldName}
              className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center border-b border-slate-100 px-4 py-2 last:border-0"
            >
              <span className="text-sm text-slate-700">{phase.label}</span>
              <Input
                placeholder="--"
                className="mx-1"
                inputMode="decimal"
                {...register(phase.fieldName, {
                  valueAsNumber: true,
                })}
                error={errors[phase.fieldName]?.message as string | undefined}
              />
              <Input
                placeholder="--"
                className="mx-1 bg-slate-100 text-slate-500"
                inputMode="decimal"
                readOnly
                tabIndex={-1}
                {...register(phase.conversionFieldName, {
                  valueAsNumber: true,
                })}
                error={errors[phase.conversionFieldName]?.message as string | undefined}
              />
            </div>
          ))}
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
