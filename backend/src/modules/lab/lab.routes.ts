import { Router } from "express";
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
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  getPatientRecordsController
);
router.get(
  "/patients/:patientId/requests",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  getPatientLabRequestsController
);
router.get(
  "/patients/:patientId/records",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY", "STAFF"]),
  getPatientLabRecordsController
);
router.post("/requests", authorize(["ADMIN", "DOCTOR"]), createLabRequestController);
router.get("/requests", authorize(["ADMIN", "LAB", "LABORATORY"]), getLabRequestsController);
router.get(
  "/requests/:labId",
  authorize(["ADMIN", "LAB", "LABORATORY", "STAFF", "DOCTOR"]),
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
  getLabPreviewController
);

export default router;
