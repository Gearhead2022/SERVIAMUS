import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import UsersRoutes from "../modules/lab/lab.routes";
import RequestsRoutes from "../modules/request/request.routes";
import PatientsRoutes from "../modules/patient/patient.routes";
import ConsultationRoutes from "../modules/consultation/consultation.routes";

const router = Router();

router.use(authenticate);

router.use("/users", UsersRoutes); // System users management related routes

router.use("/request", RequestsRoutes); // Request form related routes

router.use("/patient", PatientsRoutes); // Patient record related routes

router.use("/consultation", ConsultationRoutes); // Consultation related routes

export default router;
