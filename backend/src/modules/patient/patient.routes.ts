import { Router } from "express";
import { getAllPatientsController, addPatientController } from "./patient.controller";
const router = Router();

router.get(
  "/getAllPatients",
  getAllPatientsController
);

router.post(
  "/patientAdd",
  addPatientController
);

export default router;