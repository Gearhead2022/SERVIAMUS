import { Request, Response } from "express";
import { createConsultationResult } from "./consultation.services";

export const createConsultarionResultController = async (req: Request, res: Response) => {
  try {
    const patient = await createConsultationResult(req.body);

    return res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};