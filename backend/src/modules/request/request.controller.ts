import { Request, Response } from "express";
import { getPrevVitalSigns, createRequest, getAllRegisteredUsers, getRequestData } from "./request.services";

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

export const getAllRegisteredUsersController = async (req: Request, res: Response) => {
  try {
    const data = await getAllRegisteredUsers();

    return res.status(201).json({
      success: true,
      data: data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRequestDataController = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);

    if (!requestId || isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation_id",
      });
    }

    const prescriptions = await getRequestData(requestId);

    return res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};