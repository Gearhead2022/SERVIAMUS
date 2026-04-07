import { Router } from "express";
import { createConsultarionResultController, getAllPatientRequestController } from "./consultation.controller";

const router = Router();

// PUBLIC ROUTES
router.post(
  "/results",
  createConsultarionResultController
);

router.get(
  "/request",
  getAllPatientRequestController
);


export default router;