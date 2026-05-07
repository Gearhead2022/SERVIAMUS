import { Request, Response } from "express";
import { consultationRecordHistory, consultationRecords, consultationRecordsByRequest, createConsultationResult, createMedicalCertificate, createPresciptions, getAllPatientConsultationRecord, getAllPatientMedCertRecord, getAllRequests, getConsultationRecordById, getLabRequestByName, getPatientPrescription, getRequestsPerWeekday, getStatistics, medicalCertificateRecordHistory, prescriptionRecordHistory, requestAction } from "./consultation.services";
import { RequestStatus, RequestType } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { getIO } from "../../socket";
type NonLaboratoryRequestType = Exclude<RequestType, "LABORATORY">

export const createConsultationResultController = async (req: Request, res: Response) => {
  try {
    const consult = await createConsultationResult(req.body);

    const users = await prisma.consultationRequest.findMany({
      where: {
        cons_id: consult.cons_id
      },
      select: { physician: true },
    });

    const userIds = users.map(u => u.physician);
    const io = getIO();

    io.to(`user_${userIds}`).emit("consultation:created", {
      id: consult.cons_id,
    });

    return res.status(201).json({
      success: true,
      data: consult
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

    let req_types: RequestType[] | undefined;

    if (req.query.req_types) {
      let rawTypes: string[] = [];

      if (Array.isArray(req.query.req_types)) {
        rawTypes = req.query.req_types as string[];
      } else if (typeof req.query.req_types === "string") {
        rawTypes = req.query.req_types.split(",");
      }

      const validTypes = Object.values(RequestType);

      req_types = rawTypes.filter((type): type is RequestType =>
        validTypes.includes(type as RequestType)
      );
    }

    const request = await getAllRequests(search, req_types);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
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

export const getAllPatientConsultationController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.id);

    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient_id",
      });
    }

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const consultations = await getAllPatientConsultationRecord(
      patientId,
      search
    );

    return res.status(200).json({
      success: true,
      data: consultations,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAllPatientMedCertController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.id);

    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient_id",
      });
    }

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const certificates = await getAllPatientMedCertRecord(
      patientId,
      search
    );

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getPatientPrescriptionController = async (req: Request, res: Response) => {
  try {
    const consultationId = Number(req.params.id);

    if (!consultationId || isNaN(consultationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation_id",
      });
    }

    const prescriptions = await getPatientPrescription(consultationId);

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


export const getPrescriptionByRequestController = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);

    if (!requestId || isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation_id",
      });
    }

    const prescriptions = await consultationRecordsByRequest(requestId);

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

export const getConsultationRecordHistoryController = async (req: Request, res: Response) => {
  try {
    const prescriptions = await consultationRecordHistory();

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

export const getPrescriptionRecordHistoryController = async (req: Request, res: Response) => {
  try {
    const prescriptions = await prescriptionRecordHistory();

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

export const createMedCertResultController = async (req: Request, res: Response) => {
  try {
    const med_cert = await createMedicalCertificate(req.body);

    return res.status(201).json({
      success: true,
      data: med_cert
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getConsultationRecordByIdController = async (req: Request, res: Response) => {
  try {
    const cons_id = Number(req.params.id);

    if (!cons_id || isNaN(cons_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cons_id",
      });
    }

    const consultation = await getConsultationRecordById(cons_id);

    return res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getMedicalCertificateRecordHistoryController = async (req: Request, res: Response) => {
  try {
    const prescriptions = await medicalCertificateRecordHistory();

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

export const getWeeklyTallyController = async (req: Request, res: Response) => {
  let req_types: RequestType[] | undefined;

  if (req.query.req_types) {
    const raw = Array.isArray(req.query.req_types)
      ? req.query.req_types
      : (req.query.req_types as string).split(",");

    const valid = Object.values(RequestType);

    req_types = raw.filter(
      (t): t is RequestType => valid.includes(t as RequestType)
    );
  }

  try {
    const data = await getRequestsPerWeekday(req_types);
    res.json(data);
  } catch (err: any) {
    // console.error("CONTROLLER ERROR:", err);
    res.status(500).json({
      message: err.message,
      code: err.code,
      meta: err.meta
    });
  }
};

// all lab request by name

export const getLabRequestByNameController = async (req: Request, res: Response) => {

  const patientId = Number(req.params.id);

  const name =
    typeof req.query.name === "string" && req.query.name.trim() !== ""
      ? req.query.name.trim()
      : "";

  try {
    const data = await getLabRequestByName(name, patientId);
    res.json(data);
  } catch (err: any) {
    console.error("CONTROLLER ERROR:", err);
    res.status(500).json({
      message: err.message,
      code: err.code,
      meta: err.meta
    });
  }
};