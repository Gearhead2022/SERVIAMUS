import { Request, Response } from "express";
import { handleLabModuleError } from "./lab.errors";
import {
  createLabRequestService,
  getAllUsersService,
  getLabRequestByIdService,
  getLabRequestsService,
  getLabTestsService,
  getPatientLabRecordsService,
  getPatientRecordsService,
  saveLabResultService,
  searchPatientsService,
  updateLabRequestStatusService,
} from "./lab.services";

const labStatusValues = ["queued", "pending", "done"] as const;
const labCategoryValues = [
  "clinical-chemistry",
  "hematology",
  "parasitology",
  "urinalysis",
  "other",
] as const;
const labRecordGroupValues = [
  "clinical-chemistry",
  "clinical-microscopy",
  "hematology",
  "other",
  "serology",
] as const;

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch users.");
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
    return handleLabModuleError(res, error, "Failed to search patients.");
  }
};

export const getLabTestsController = async (_req: Request, res: Response) => {
  try {
    const tests = await getLabTestsService();

    return res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch laboratory tests.");
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
    return handleLabModuleError(res, error, "Failed to fetch patient records.");
  }
};

export const getPatientLabRecordsController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);
    const dateFrom =
      typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined;
    const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo : undefined;
    const recordGroup =
      typeof req.query.recordGroup === "string" ? req.query.recordGroup : undefined;

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient record request.",
      });
    }

    if (
      recordGroup &&
      !labRecordGroupValues.includes(
        recordGroup as (typeof labRecordGroupValues)[number]
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid laboratory record category filter.",
      });
    }

    const records = await getPatientLabRecordsService(patientId, {
      dateFrom,
      dateTo,
      recordGroup,
    });

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return handleLabModuleError(
      res,
      error,
      "Failed to fetch patient laboratory records."
    );
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
    return handleLabModuleError(res, error, "Failed to create the lab request.");
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
    return handleLabModuleError(res, error, "Failed to fetch lab requests.");
  }
};

export const getLabRequestByIdController = async (req: Request, res: Response) => {
  try {
    const labId = Number(req.params.labId);

    if (!Number.isInteger(labId) || labId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid laboratory request id.",
      });
    }

    const request = await getLabRequestByIdService(labId);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch the lab request.");
  }
};

export const updateLabRequestStatusController = async (req: Request, res: Response) => {
  try {
    const labId = Number(req.params.labId);
    const status = req.body?.status;
    const userId = req.user?.user_id;

    if (!labId || !labStatusValues.includes(status)) {
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
    return handleLabModuleError(res, error, "Failed to update the lab request status.");
  }
};

export const saveLabResultController = async (req: Request, res: Response) => {
  try {
    const { labId, category, form, pathologistUserId } = req.body ?? {};
    const userId = req.user?.user_id;

    if (
      !labId ||
      !labCategoryValues.includes(category) ||
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
    return handleLabModuleError(res, error, "Failed to save the lab result.");
  }
};
