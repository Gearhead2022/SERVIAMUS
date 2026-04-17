"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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

type TestRow = {
  label: string;
  name: keyof ClinicalChemistryFormValues;
  convName?: keyof ClinicalChemistryFormValues;
  calculateConversion?: (value: number) => number;
};

const testRows: TestRow[] = [
  {
    label: "FBS (Fasting Blood Sugar)",
    name: "FBS",
    convName: "FBS_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.055)*100)/100,
  },
  {
    label: "RBS (Random Blood Sugar)",
    name: "RBS",
    convName: "RBS_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.055)*100)/100,
  },
  {
    label: "BUN (Blood Urea Nitrogen)",
    name: "BUN",
    convName: "BUN_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.357)*100)/100,
  },
  {
    label: "Creatinine",
    name: "creatinine",
    convName: "creatinine_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 88.4)*100)/100,
  },
  {
    label: "Uric Acid",
    name: "uric_acid",
    convName: "uric_acid_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.059)*100)/100,
  },
  {
    label: "Total Cholesterol",
    name: "cholesterol",
    convName: "cholesterol_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.026) * 100) / 100,
  },
  {
    label: "HDL Cholesterol",
    name: "hdl_cholesterol",
    convName: "hdl_cholesterol_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.026) * 100) / 100,
  },
  {
    label: "LDL Cholesterol",
    name: "ldl_cholesterol",
    convName: "ldl_cholesterol_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.026) * 100) / 100,
  },
  {
    label: "Triglycerides",
    name: "triglycerides",
    convName: "triglycerides_conv",
    calculateConversion: (value) => Math.round(Math.abs(value * 0.011) * 100) / 100,
  },
  { label: "SGPT", name: "sgpt" },
];

function hasConversion(
  row: TestRow
): row is TestRow & {
  convName: keyof ClinicalChemistryFormValues;
  calculateConversion: (value: number) => number;
} {
  return Boolean(row.convName && row.calculateConversion);
}

const calculatedRows = testRows.filter(hasConversion);

function resolveConversionValue(
  rawValue: string | number,
  calculateConversion?: (value: number) => number
) {
  const numericValue = typeof rawValue === "number"
    ? rawValue
    : Number(rawValue);

  if (isNaN(numericValue)) return "";

  return calculateConversion
    ? calculateConversion(numericValue)
    : numericValue;
}

export default function ClinicalChemistryModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    control, 
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ClinicalChemistryFormValues>({
    resolver: zodResolver(clinicalChemistrySchema),
    defaultValues: {
      ...clinicalChemistryDefaultValues,
      ...(initialValues ?? {}),
    },
  });

  const watchedResultValues = useWatch({
    control,
    name: calculatedRows.map((row) => row.name),
  });

  useEffect(() => {
    calculatedRows.forEach(({ name, convName, calculateConversion }, index) => {
      const nextConversionValue = resolveConversionValue(
        watchedResultValues[index] ?? getValues(name),
        calculateConversion
      );

      if (getValues(convName) === nextConversionValue) {
        return;
      }

      setValue(convName, nextConversionValue, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });
  }, [getValues, setValue, watchedResultValues]);

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
                inputMode="decimal"
                {...register(row.name)}
                error={errors[row.name]?.message}
              />
              {row.convName ? (
                <Input
                  placeholder="-"
                  className="mx-1 bg-slate-100 text-slate-500"
                  inputMode="decimal"
                  readOnly
                  tabIndex={-1}
                  {...register(row.convName)}
                  error={errors[row.convName]?.message}
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

        <div></div>

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
