import { Router } from "express";
import { createConsultationResultController, createFollowupResultController, createMedCertResultController, createPrescriptionController, getAllPatientConsultationController, getAllPatientMedCertController, getAllPatientRequestController, getConsultationRecordByIdController, getConsultationRecordHistoryController, getConsultationResultByIdController, getConsultationRxByIdController, getDoctorByIdController, getFollowupRecordsController, getFollowupResultByIdController, getInitialConsultationController, getInitialConsultationWithPrevFollowupsController, getLabRequestByNameController, getMedicalCertificateByIdController, getMedicalCertificateRecordHistoryController, getPatientPrescriptionController, getPatientRecordController, getPrescriptionByRequestController, getPrescriptionRecordHistoryController, getStatisticsController, getWeeklyTallyController, laboratoryRecordHistoryController, updateConsultationVitalsController, updateRequestStatusController } from "./consultation.controller";

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

router.patch(
  "/:id/vitals",
  updateConsultationVitalsController
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

// router.get(
//   "/:id/getAllPatientPrescriptionRecords",
//   getAllPatientPrescriptionController
// );

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

router.get(
  "/laboratoryRecordHistory",
  laboratoryRecordHistoryController
)

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

router.get(
  "/:id/getFollowupRecordByIdz",
  getFollowupResultByIdController
)

router.get(
  "/:id/getFollowupRecords",
  getFollowupRecordsController
);

// get initial consultations
router.get(
  "/:id/consultation-cases",
  getInitialConsultationController
);

router.post(
  "/createFollowup",
  createFollowupResultController
);

//get Initial consultation and previous followups

router.get(
  "/:patientId/patient/:consultationId/followups",
  getInitialConsultationWithPrevFollowupsController
);


export default router;
