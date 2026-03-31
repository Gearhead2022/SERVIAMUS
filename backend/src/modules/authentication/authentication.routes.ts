import { Router } from "express";

import {
  authRoleController,
  authLoginController,
  authRegisterController
} from "./authentication.controller";

const router = Router();

// PUBLIC ROUTES
router.post(
  "/login",
  authLoginController
);

router.post(
  "/register",
  authRegisterController
);

router.get(
  "/roles",
  authRoleController
);

// role guarded routes 

// router.post(
//   "/inventory-adjustment",
//   authorize(["ADMIN", "MANAGER"]),
//   controller
// );


export default router;
