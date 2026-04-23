"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import {
  createSingleChemistrySchema,
  getSingleChemistryDefaultValues,
  SingleChemistryFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  config: {
    conversionFactor?: number;
    conversionFieldName?: string;
    conversionLabel?: string;
    fieldLabel: string;
    fieldName: string;
    showMealFields?: boolean;
  };
  initialValues?: LabResultPayload | null;
  onSubmit: (form: SingleChemistryFormValues) => void;
  onCancel: () => void;
};

const roundConversionValue = (value: number) => Math.round(value * 100) / 100;

export default function SingleChemistryModal({
  config,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const schema = useMemo(
    () =>
      createSingleChemistrySchema({
        conversionFieldName: config.conversionFieldName,
        fieldLabel: config.fieldLabel,
        fieldName: config.fieldName,
        showMealFields: config.showMealFields,
      }),
    [config]
  );

  const defaultValues = useMemo(
    () =>
      mergeLabFormDefaults(
        getSingleChemistryDefaultValues({
          conversionFieldName: config.conversionFieldName,
          fieldName: config.fieldName,
          showMealFields: config.showMealFields,
        }),
        initialValues
      ),
    [config, initialValues]
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

  const watchedResult = useWatch({
    control,
    name: config.fieldName,
  });

  useEffect(() => {
    if (!config.conversionFieldName || !config.conversionFactor) {
      return;
    }

    const numericValue =
      typeof watchedResult === "number" ? watchedResult : Number(watchedResult);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    setValue(
      config.conversionFieldName,
      roundConversionValue(numericValue * config.conversionFactor),
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
  }, [
    config.conversionFactor,
    config.conversionFieldName,
    setValue,
    watchedResult,
  ]);

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values as SingleChemistryFormValues))}
      className="space-y-5 p-5"
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            {config.fieldLabel}
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Input
            label={config.fieldLabel}
            inputMode="decimal"
            placeholder="Enter result"
            {...register(config.fieldName, { valueAsNumber: true })}
            error={errors[config.fieldName]?.message as string | undefined}
          />
          {config.conversionFieldName ? (
            <Input
              label={config.conversionLabel ?? "Conversion"}
              className="bg-slate-100 text-slate-500"
              inputMode="decimal"
              readOnly
              tabIndex={-1}
              {...register(config.conversionFieldName, { valueAsNumber: true })}
              error={errors[config.conversionFieldName]?.message as string | undefined}
            />
          ) : null}

          {config.showMealFields ? (
            <>
              <Input
                label="Last Meal"
                placeholder="Enter last meal details"
                {...register("last_meal")}
                error={errors.last_meal?.message as string | undefined}
              />
              <Input
                label="Time Taken"
                placeholder="Enter collection time"
                {...register("time_taken")}
                error={errors.time_taken?.message as string | undefined}
              />
            </>
          ) : null}

          <div className="col-span-2">
            <Textarea
              label="Remarks"
              rows={4}
              placeholder="Optional notes"
              {...register("remarks")}
              error={errors.remarks?.message as string | undefined}
            />
          </div>
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
