import { Router } from "express";
import { getAdminDashboardController, getAllServicesController, updateServiceController } from "./admin.controller";

const router = Router();

router.get(
    "/services",
    getAllServicesController
);

router.put(
    "/:id/update",
    updateServiceController
);

router.get(
    "/dashboard/admin",
    getAdminDashboardController
);

// router.get(
//     "/services/:id",
//     getServiceByIdController
// );

// router.post(
//     "/services",
//     createServiceController
// );

// router.patch(
//     "/services/:id/price",
//     updateServicePriceController
// );

// router.delete(
//     "/services/:id",
//     deleteServiceController
// );

export default router;