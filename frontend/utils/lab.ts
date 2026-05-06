import { LabResultPayload, LabResultValue } from "@/types/LabTypes";

type LabFormDefaults = Record<string, string | number>;

const parseNumericValue = (value: LabResultValue | undefined, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return fallback;
    }

    const parsedValue = Number(trimmed);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return fallback;
};

export const mergeLabFormDefaults = <T extends LabFormDefaults>(
  defaults: T,
  initialValues?: Partial<Record<keyof T, LabResultValue>> | null
) => {
  const nextValues = { ...defaults };

  if (!initialValues) {
    return nextValues;
  }

  (Object.keys(defaults) as Array<keyof T>).forEach((key) => {
    const defaultValue = defaults[key];
    const initialValue = initialValues[key];

    if (typeof defaultValue === "number") {
      nextValues[key] = parseNumericValue(initialValue, defaultValue) as T[keyof T];
      return;
    }

    if (typeof initialValue === "number") {
      nextValues[key] = String(initialValue) as T[keyof T];
      return;
    }

    if (typeof initialValue === "string") {
      nextValues[key] = initialValue as T[keyof T];
    }
  });

  return nextValues;
};

export const formatLabResultValue = (
  value: LabResultValue | undefined,
  fallback = "__________________"
) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
};

export const hasDisplayableLabResultValue = (value: LabResultValue | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return true;
  }

  return typeof value === "string" && value.trim().length > 0;
};

export const normalizeLabPayload = (payload?: LabResultPayload | null) => {
  if (!payload) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null && value !== undefined)
  ) as LabResultPayload;
};
