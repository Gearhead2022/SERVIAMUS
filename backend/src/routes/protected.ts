// TODO:FIX MERGE CONFLICTS

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import LabRoutes from "../modules/lab/lab.routes";
import BillingRoutes from "../modules/billing/billing.routes";
import RequestsRoutes from "../modules/request/request.routes";
import PatientsRoutes from "../modules/patient/patient.routes";
import ConsultationRoutes from "../modules/consultation/consultation.routes";
import QueueRoutes from "../modules/queue/queue.routes";

const router = Router();

router.use(authenticate);

router.use("/billing", BillingRoutes); //  Billing routes

router.use("/billing", BillingRoutes); // Cashier billing routes

router.use("/request", RequestsRoutes); // Request form related routes

router.use("/patient", PatientsRoutes); // Patient record related routes

router.use("/consultation", ConsultationRoutes); // Consultation related routes

router.use("/queue", QueueRoutes);  // Queue management routes

export default router;