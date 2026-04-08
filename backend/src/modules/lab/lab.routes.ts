import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  createLabRequestController,
  getAllUsersController,
  getLabRequestsController,
  getPatientRecordsController,
  saveLabResultController,
  searchPatientsController,
  updateLabRequestStatusController,
} from "./lab.controller";

const router = Router();

router.get("/users", authorize(["ADMIN", "LAB", "LABORATORY"]), getAllUsersController);
router.get(
  "/patients",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  searchPatientsController
);
router.get(
  "/records",
  authorize(["ADMIN", "DOCTOR", "LAB", "LABORATORY"]),
  getPatientRecordsController
);
router.post("/requests", authorize(["ADMIN", "DOCTOR"]), createLabRequestController);
router.get("/requests", authorize(["ADMIN", "LAB", "LABORATORY"]), getLabRequestsController);
router.patch(
  "/requests/:labId/status",
  authorize(["ADMIN", "LAB", "LABORATORY"]),
  updateLabRequestStatusController
);
router.post("/results", authorize(["ADMIN", "LAB", "LABORATORY"]), saveLabResultController);

export default router;
