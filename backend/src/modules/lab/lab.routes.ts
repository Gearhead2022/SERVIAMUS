import { Router } from "express";

import {
  sampleController
} from "./lab.controller";

const router = Router();

// PUBLIC ROUTES
router.post(
  "/lab",
  sampleController
);




export default router;
