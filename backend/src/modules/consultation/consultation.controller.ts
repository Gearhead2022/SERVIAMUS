import { Request, Response } from "express";
<<<<<<< HEAD
import { consultationRecords, createConsultationResult, createPresciptions, getAllConsultationRequest, getStatistics, requestAction } from "./consultation.services";
import { RequestStatus } from "@prisma/client";

=======
import { createConsultationResult } from "./consultation.services";
>>>>>>> sub_main

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
    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const request = await getAllConsultationRequest(search);

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

export const updateRequestStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body as { status: RequestStatus };

    if (!requestId || isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    if (!["SERVING", "CANCELED", "DONE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await requestAction(requestId, status);

    res.status(200).json({
      message: "Request updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getPatientRecordController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.id);

    const request = await consultationRecords(patientId);

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

export const getStatisticsController = async (req: Request, res: Response) => {
  try {
    const result = await getStatistics();

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
}

export const createPrescriptionController = async (req: Request, res: Response) => {

  try {
    const prescription = await createPresciptions(req.body);

    return res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}
};
