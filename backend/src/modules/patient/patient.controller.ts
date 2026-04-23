import { Request, Response } from "express";
import { getAllPatients, addPatient, getPatientById, updatePatient } from "./patient.services";

export const getAllPatientsController = async (req: Request, res: Response) => {
  try {
    const search =
    typeof req.query.search === "string" && req.query.search.trim() !== ""
      ? req.query.search.trim()
      : undefined;
      
    const patients = await getAllPatients(search);

    return res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addPatientController = async (req: Request, res: Response) => {
  try {
    const patient = await addPatient(req.body);

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

export const getPatientByIdController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await getPatientById(patientId);

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePatientController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await updatePatient(patientId, req.body);

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
