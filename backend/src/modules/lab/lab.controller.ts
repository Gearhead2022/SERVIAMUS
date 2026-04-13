import { Request, Response } from "express";
import {
  createLabRequestService,
  getAllUsersService,
  getLabRequestsService,
  getPatientRecordsService,
  saveLabResultService,
  searchPatientsService,
  updateLabRequestStatusService,
} from "./lab.services";

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users.",
    });
  }
};

export const searchPatientsController = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const patients = await searchPatientsService(search);

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to search patients.",
    });
  }
};

export const getPatientRecordsController = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const records = await getPatientRecordsService(search);

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch patient records.",
    });
  }
};

export const createLabRequestController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { patientId, requestedBy, tests, requestedDate } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!patientId || !Array.isArray(tests)) {
      return res.status(400).json({
        success: false,
        message: "Patient and requested tests are required.",
      });
    }

    const request = await createLabRequestService({
      patientId: Number(patientId),
      userId,
      requestedBy: typeof requestedBy === "string" ? requestedBy : undefined,
      requestedDate: typeof requestedDate === "string" ? requestedDate : undefined,
      tests,
    });

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create the lab request.",
    });
  }
};

export const getLabRequestsController = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const requests = await getLabRequestsService(status);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch lab requests.",
    });
  }
};

export const updateLabRequestStatusController = async (req: Request, res: Response) => {
  try {
    const labId = Number(req.params.labId);
    const status = req.body?.status;
    const userId = req.user?.user_id;

    if (!labId || !["queued", "pending", "done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab request status update.",
      });
    }

    const request = await updateLabRequestStatusService(labId, status, userId);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update the lab request status.",
    });
  }
};

export const saveLabResultController = async (req: Request, res: Response) => {
  try {
    const { labId, category, form, pathologistUserId } = req.body ?? {};
    const userId = req.user?.user_id;

    if (
      !labId ||
      !["clinical-chemistry", "hematology", "parasitology", "urinalysis", "other"].includes(
        category
      ) ||
      !form ||
      typeof form !== "object"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab result payload.",
      });
    }

    const result = await saveLabResultService({
      labId: Number(labId),
      category,
      form,
      userId,
      pathologistUserId:
        typeof pathologistUserId === "number" ? pathologistUserId : null,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to save the lab result.",
    });
  }
};
