import { Response } from "express";

export class PatientChartError extends Error {
  constructor(public readonly statusCode = 400, message = "Patient chart request failed.") {
    super(message);
  }
}

export const handlePatientChartError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof PatientChartError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  return res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : fallback,
  });
};
