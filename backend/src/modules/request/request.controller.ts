import { Request, Response } from "express";
import { getPrevVitalSigns, createRequest } from "./request.services";

export const getPrevVitalSignsController = async (req: Request, res: Response) => {
  try {
    const patient_id = Number(req.query.patient_id);

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient_id",
      });
    }

    const vitals = await getPrevVitalSigns(patient_id);

    return res.status(201).json({
      success: true,
      data: vitals
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createRequestController = async (req: Request, res: Response) => {
  try {
    const patient = await createRequest(req.body);

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