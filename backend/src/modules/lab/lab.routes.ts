import express, { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  createLabRequestController,
  getAllUsersController,
  getLabRequestByIdController,
  getLabRequestsController,
  getPatientLabRequestsController,
  getLabTestsController,
  getPatientLabRecordsController,
  getPatientRecordsController,
  saveLabResultController,
  searchPatientsController,
  updateLabRequestStatusController,
  getLabPreviewController,
  downloadExternalLabAttachmentController,
  getExternalLabAttachmentsController,
  getExternalLabAttachmentWorklistController,
  uploadExternalLabAttachmentController,
} from "./lab.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/users", authorize(["ADMIN", "LAB", "LABORATORY"]), getAllUsersController);
router.get(
  "/patients",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  searchPatientsController
);
router.get(
  "/tests",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "STAFF"]),
  getLabTestsController
);
router.get(
  "/records",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "ENCODER"]),
  getPatientRecordsController
);
router.get(
  "/patients/:patientId/requests",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  getPatientLabRequestsController
);
router.get(
  "/patients/:patientId/records",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "STAFF", "ENCODER"]),
  getPatientLabRecordsController
);
router.get(
  "/patients/:patientId/attachments",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  getExternalLabAttachmentsController
);
router.get(
  "/attachments/worklist",
  authorize(["DOCTOR"]),
  getExternalLabAttachmentWorklistController
);
router.get(
  "/attachments/:attachmentId/file",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  downloadExternalLabAttachmentController
);
router.post(
  "/attachments",
  authorize(["ADMIN", "LAB", "LABORATORY"]),
  express.raw({ type: "application/octet-stream", limit: "10mb" }),
  uploadExternalLabAttachmentController
);
router.post("/requests", authorize(["ADMIN", "DOCTOR"]), createLabRequestController);
router.get("/requests", authorize(["ADMIN", "LAB", "LABORATORY"]), getLabRequestsController);
router.get(
  "/requests/:labId",
  authorize(["ADMIN", "LAB", "LABORATORY", "STAFF", "DOCTOR", "ENCODER"]),
  getLabRequestByIdController
);
router.patch(
  "/requests/:labId/status",
  authorize(["ADMIN", "LAB", "LABORATORY"]),
  updateLabRequestStatusController
);
router.post("/results", authorize(["ADMIN", "LAB", "LABORATORY"]), saveLabResultController);

//added by john

router.get(
  "/preview/:labid",
  authorize(["ADMIN", "LAB", "LABORATORY", "STAFF", "DOCTOR", "ENCODER"]),
  getLabPreviewController
);

export default router;
