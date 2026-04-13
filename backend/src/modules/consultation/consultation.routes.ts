import { Router } from "express";
import { createConsultarionResultController, createPrescriptionController, getAllPatientRequestController, getPatientRecordController, getStatisticsController, updateRequestStatusController } from "./consultation.controller";

const router = Router();

// PUBLIC ROUTES
router.post(
  "/results",
  createConsultarionResultController
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


export default router;