import { Router } from "express";
import { createConsultationResultController, createMedCertResultController, createPrescriptionController, getAllPatientConsultationController, getAllPatientMedCertController, getAllPatientRequestController, getConsultationRecordByIdController, getConsultationRecordHistoryController, getMedicalCertificateRecordHistoryController, getPatientPrescriptionController, getPatientRecordController, getPrescriptionByRequestController, getPrescriptionRecordHistoryController, getStatisticsController, updateRequestStatusController } from "./consultation.controller";

const router = Router();

// PUBLIC ROUTES
router.post(
  "/results",
  createConsultationResultController
);

router.get(
  "/requestList",
  getAllPatientRequestController
);

router.patch(
  "/:id/status",
  updateRequestStatusController
);

router.get(
  "/:id/patientRecord",
  getPatientRecordController
);

router.get(
  "/statisticsRecord",
  getStatisticsController
);

router.post(
  "/createPrescription",
  createPrescriptionController
);

// per patient records

router.get(
  "/:id/getAllPatientConsultationRecords",
  getAllPatientConsultationController
);

router.get(
  "/:id/getAllPatientMedCertRecords",
  getAllPatientMedCertController
);


router.get(
  "/:id/getPrescriptionRecord",
  getPatientPrescriptionController
);

router.get(
  "/:id/getConsultationRecord",
  getPrescriptionByRequestController
);

// historical records

router.get(
  "/prescriptionRecordHistory",
  getPrescriptionRecordHistoryController
);

router.get(
  "/consultationRecordHistory",
  getConsultationRecordHistoryController
);

router.get(
  "/medCertRecordHistory",
  getMedicalCertificateRecordHistoryController
);

router.post(
  "/medicalCertificateResult",
  createMedCertResultController
);

// records per id

router.get(
  "/:id/getConsultationRecordById",
  getConsultationRecordByIdController
);




export default router;