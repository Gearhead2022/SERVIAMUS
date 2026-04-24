import { Router } from "express";
import { getAllPatientsController, addPatientController, getPatientByIdController, updatePatientController } from "./patient.controller";
const router = Router();

router.get(
  "/getAllPatients",
  getAllPatientsController
);

router.post(
  "/patientAdd",
  addPatientController
);

router.get(
  "/:id",
  getPatientByIdController
);

router.put(
  "/:id",
  updatePatientController
);

export default router;