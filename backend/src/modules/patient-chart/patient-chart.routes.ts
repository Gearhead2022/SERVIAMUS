import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { deletePatientChartAttachmentController, downloadPatientChartAttachmentController, listPatientChartAttachmentsController, resolvePatientChartBatchPatientsController, uploadPatientChartAttachmentController } from "./patient-chart.controller";

const router = Router();
router.use(authenticate);
router.post("/batch/resolve-patients", authorize(["ADMIN"]), resolvePatientChartBatchPatientsController);
router.get("/patients/:patientId/attachments", authorize(["ADMIN", "DOCTOR", "STAFF"]), listPatientChartAttachmentsController);
router.get("/attachments/:attachmentId/file", authorize(["ADMIN", "DOCTOR", "STAFF"]), downloadPatientChartAttachmentController);
router.delete("/attachments/:attachmentId", authorize(["ADMIN"]), deletePatientChartAttachmentController);
router.post(
  "/attachments",
  authorize(["ADMIN"]),
  uploadPatientChartAttachmentController
);
export default router;
