import { Response } from "express";

export class LabModuleError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "LabModuleError";
    this.statusCode = statusCode;
  }
}

export const handleLabModuleError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  if (error instanceof LabModuleError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : fallbackMessage,
  });
};
