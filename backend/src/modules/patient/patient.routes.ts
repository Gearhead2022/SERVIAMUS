import { Router } from "express";
import {
  addPatientController,
  deletePatientController,
  getAllPatientsController,
  getPatientByIdController,
  getPatientDeletionRequestsController,
  reviewPatientDeletionRequestController,
  updatePatientController,
} from "./patient.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
const router = Router();

router.use(authenticate);

router.get(
  "/getAllPatients", authorize(["ADMIN", "STAFF", "DOCTOR", "ENCODER"]),
  getAllPatientsController
);

router.post(
  "/patientAdd", authorize(["ADMIN", "STAFF", "ENCODER"]),
  addPatientController
);

router.get(
  "/:id/patientInfo", authorize(["ADMIN", "STAFF", "DOCTOR", "ENCODER"]),
  getPatientByIdController
);

router.put(
  "/:id/patientUpdate", authorize(["ADMIN", "STAFF", "DOCTOR", "ENCODER"]),
  updatePatientController
);

router.delete(
  "/:id/patientDelete", authorize(["ADMIN", "STAFF", "ENCODER"]),
  deletePatientController
);

router.get(
  "/deletion-requests",
  authorize(["ADMIN"]),
  getPatientDeletionRequestsController
);

router.patch(
  "/deletion-requests/:requestId",
  authorize(["ADMIN"]),
  reviewPatientDeletionRequestController
);


export default router;
