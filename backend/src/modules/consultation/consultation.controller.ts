import { Request, Response } from "express";
import { createConsultationResult, getAllConsultationRequest } from "./consultation.services";

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

export const getAllPatientRequestController = async (req: Request, res: Response) => {
  try {      
    const request = await getAllConsultationRequest();

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};