import { Request, Response } from "express";
import { consultationRecordHistory, consultationRecords, consultationRecordsByRequest, createConsultationResult, createMedicalCertificate, createPresciptions, getAllPatientConsultationRecord, getAllPatientMedCertRecord, getAllRequests, getConsultationRecordById, getConsultationResultById, getConsultationRxById, getDoctorById, getFollowupRecords, getInitialConsultations, getLabRequestByName, getMedicalCertificateById, getPatientPrescription, getRequestsPerWeekday, getStatistics, laboratoryRecordHistory, medicalCertificateRecordHistory, prescriptionRecordHistory, requestAction } from "./consultation.services";
import { RequestStatus, RequestType } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { getIO } from "../../socket";
import { createNotification, resolveUsersByRoleNames } from "../notification/notification.services";

type NonLaboratoryRequestType = Exclude<RequestType, "LABORATORY">;

const WORKFLOW_ROOMS = ["role_ADMIN", "role_CASHIER", "role_LAB", "role_LABORATORY", "role_STAFF", "role_DOCTOR"] as const;

export const createConsultationResultController = async (req: Request, res: Response) => {
  try {
    const consult = await createConsultationResult(req.body);

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("consultation:updated");

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
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" && req.query.status !== ""
        ? req.query.status
        : undefined;

    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom !== ""
        ? req.query.dateFrom
        : undefined;

    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo !== ""
        ? req.query.dateTo
        : undefined;

    const sort =
      typeof req.query.sort === "string" && req.query.sort !== ""
        ? req.query.sort
        : undefined;


    const req_type =
      typeof req.query.req_type === "string" && req.query.req_type !== ""
        ? req.query.req_type
        : undefined;

    const request = await getAllRequests(page, limit, search, status, req_type, dateFrom, dateTo, sort);

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

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("consultation:updated");
    io.to([...WORKFLOW_ROOMS]).emit("request:updated");

    const payload = {
      patientId: result.patient_id,
      reason: "request-created",
      requestId: result.req_id,
    };

    if (result.status === "DONE") {

      io.to([...WORKFLOW_ROOMS]).emit("consultation:updated", payload);

      io.to([...WORKFLOW_ROOMS]).emit("billing:updated", {
        ...payload,
        reason: "billing-created",
      });

      const cashierUserIds = await resolveUsersByRoleNames(["CASHIER"]);

      await createNotification({
        userIds: cashierUserIds,
        type: "NEW_REQUEST",
        title: `New ${result.req_type} Billing`,
        message: `A ${result.req_type} billing record is ready for cashier processing.`,
        entity: "billing",
        entity_id: result.req_id,
      });
    }

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

    const requestId = Number(req.query.request_id) || 1;

    const request = await consultationRecords(patientId, requestId);

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
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" && req.query.status !== ""
        ? req.query.status
        : undefined;

    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom !== ""
        ? req.query.dateFrom
        : undefined;

    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo !== ""
        ? req.query.dateTo
        : undefined;

    const sort =
      typeof req.query.sort === "string" && req.query.sort !== ""
        ? req.query.sort
        : undefined;

    const prescriptions = await consultationRecordHistory(page, limit, search, status, dateFrom, dateTo, sort);

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

// START HISTORY & RECORDS

export const getPrescriptionRecordHistoryController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" && req.query.status !== ""
        ? req.query.status
        : undefined;

    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom !== ""
        ? req.query.dateFrom
        : undefined;

    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo !== ""
        ? req.query.dateTo
        : undefined;

    const sort =
      typeof req.query.sort === "string" && req.query.sort !== ""
        ? req.query.sort
        : undefined;

    const prescriptions = await prescriptionRecordHistory(page, limit, search, status, dateFrom, dateTo, sort);

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

export const getMedicalCertificateRecordHistoryController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" && req.query.status !== ""
        ? req.query.status
        : undefined;

    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom !== ""
        ? req.query.dateFrom
        : undefined;

    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo !== ""
        ? req.query.dateTo
        : undefined;

    const sort =
      typeof req.query.sort === "string" && req.query.sort !== ""
        ? req.query.sort
        : undefined;

    const prescriptions = await medicalCertificateRecordHistory(page, limit, search, status, dateFrom, dateTo, sort);

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

export const laboratoryRecordHistoryController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" && req.query.status !== ""
        ? req.query.status
        : undefined;

    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom !== ""
        ? req.query.dateFrom
        : undefined;

    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo !== ""
        ? req.query.dateTo
        : undefined;

    const sort =
      typeof req.query.sort === "string" && req.query.sort !== ""
        ? req.query.sort
        : undefined;

    const prescriptions = await laboratoryRecordHistory(page, limit, search, status, dateFrom, dateTo, sort);

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
// END HISTORY & RECORDS

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
        message: "Invalid cons_ids",
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

export const getConsultationResultByIdController = async (req: Request, res: Response) => {
  const cons_id = Number(req.params.id);

  try {
    const data = await getConsultationResultById(cons_id);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
      code: err.code,
      meta: err.meta
    });
  }
};

export const getDoctorByIdController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const doctorId = parseInt(id, 10);

    if (isNaN(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const doctor = await getDoctorById(doctorId);

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConsultationRxByIdController = async (req: Request, res: Response) => {
  const req_id = Number(req.params.id);

  try {
    const data = await getConsultationRxById(req_id);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
      code: err.code,
      meta: err.meta
    });
  }
};

export const getMedicalCertificateByIdController = async (req: Request, res: Response) => {
  const req_id = Number(req.params.id);
  try {
    const data = await getMedicalCertificateById(req_id);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
      code: err.code,
      meta: err.meta
    });
  }
};

export const getFollowupRecordsController = async (req: Request, res: Response) => {
  try {
    const cons_id = Number(req.params.id);

    if (!cons_id || isNaN(cons_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cons_ids",
      });
    }

    const consultation = await getFollowupRecords(cons_id);

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

export const getInitialConsultationController = async (req: Request, res: Response) => {

  const patientId = Number(req.params.id);

  try {
    const data = await getInitialConsultations(patientId);
    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err: any) {
    console.error("CONTROLLER ERROR:", err);
    res.status(500).json({
      message: err.message,
      code: err.code,
      meta: err.meta
    });
  }
};