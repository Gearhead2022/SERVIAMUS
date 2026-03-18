import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import UsersRoutes from "../modules/lab/lab.routes";

const router = Router();

router.use(authenticate);

router.use("/users", UsersRoutes);

export default router;
