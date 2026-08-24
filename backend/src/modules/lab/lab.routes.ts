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

router.get("/users", authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST", "ENCODER"]), getAllUsersController);
router.get(
  "/patients",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST"]),
  searchPatientsController
);
router.get(
  "/tests",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST", "STAFF"]),
  getLabTestsController
);
router.get(
  "/records",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST", "ENCODER"]),
  getPatientRecordsController
);
router.get(
  "/patients/:patientId/requests",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST"]),
  getPatientLabRequestsController
);
router.get(
  "/patients/:patientId/records",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST", "STAFF", "ENCODER"]),
  getPatientLabRecordsController
);
router.get(
  "/patients/:patientId/attachments",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST", "STAFF", "ENCODER"]),
  getExternalLabAttachmentsController
);
router.get(
  "/attachments/worklist",
  authorize(["DOCTOR"]),
  getExternalLabAttachmentWorklistController
);
router.get(
  "/attachments/:attachmentId/file",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "PATHOLOGIST", "STAFF", "ENCODER"]),
  downloadExternalLabAttachmentController
);
router.post(
  "/attachments",
  authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST"]),
  express.raw({ type: "application/octet-stream", limit: "10mb" }),
  uploadExternalLabAttachmentController
);
router.post("/requests", authorize(["ADMIN", "DOCTOR"]), createLabRequestController);
router.get("/requests", authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST"]), getLabRequestsController);
router.get(
  "/requests/:labId",
  authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST", "STAFF", "DOCTOR", "ENCODER"]),
  getLabRequestByIdController
);
router.patch(
  "/requests/:labId/status",
  authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST"]),
  updateLabRequestStatusController
);
router.post("/results", authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST"]), saveLabResultController);

//added by john

router.get(
  "/preview/:labid",
  authorize(["ADMIN", "LAB", "LABORATORY", "PATHOLOGIST", "STAFF", "DOCTOR", "ENCODER"]),
  getLabPreviewController
);

export default router;
