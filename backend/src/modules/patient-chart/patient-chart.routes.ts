import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { downloadPatientChartAttachmentController, listPatientChartAttachmentsController, uploadPatientChartAttachmentController } from "./patient-chart.controller";

const router = Router();
router.use(authenticate);
router.get("/patients/:patientId/attachments", authorize(["ADMIN", "DOCTOR", "STAFF"]), listPatientChartAttachmentsController);
router.get("/attachments/:attachmentId/file", authorize(["ADMIN", "DOCTOR", "STAFF"]), downloadPatientChartAttachmentController);
router.post(
  "/attachments",
  authorize(["ADMIN"]),
  uploadPatientChartAttachmentController
);
export default router;
