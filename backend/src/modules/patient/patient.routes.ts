import { Router } from "express";
import { addPatientController, deletePatientController, getAllPatientsController, getPatientByIdController, updatePatientController } from "./patient.controller";
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
  "/:id/patientInfo",
  getPatientByIdController
);

router.put(
  "/:id/patientUpdate",
  updatePatientController
);

router.delete(
  "/:id/patientDelete",
  deletePatientController
);


export default router;
