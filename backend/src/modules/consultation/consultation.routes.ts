import { Router } from "express";
import { createConsultationResultController, createMedCertResultController, createPrescriptionController, getAllPatientConsultationController, getAllPatientMedCertController, getAllPatientRequestController, getConsultationRecordByIdController, getConsultationRecordHistoryController, getConsultationResultByIdController, getConsultationRxByIdController, getDoctorByIdController, getLabRequestByNameController, getMedicalCertificateByIdController, getMedicalCertificateRecordHistoryController, getPatientPrescriptionController, getPatientRecordController, getPrescriptionByRequestController, getPrescriptionRecordHistoryController, getStatisticsController, getWeeklyTallyController, updateRequestStatusController } from "./consultation.controller";

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

// dashboard graph

router.get(
  "/getRequestPerWeek",
  getWeeklyTallyController
);


// dashboard lab requests

router.get(
  "/:id/getLabRequestByName",
  getLabRequestByNameController
);


router.get(
  "/:id/getConsultationRecordByIdz",
  getConsultationResultByIdController
)

router.get(
  "/:id/getDoctorById",
  getDoctorByIdController
)

router.get(
  "/:id/getConsultationRxById",
  getConsultationRxByIdController
)

router.get(
  "/:id/getMedicalCertificateById",
  getMedicalCertificateByIdController
)


export default router;