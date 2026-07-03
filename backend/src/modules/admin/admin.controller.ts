import { Request, Response } from "express";
import { getAdminDashboard, getAllServices, updateService } from "./admin.services";
import { getIO } from "../../socket";
import { createNotification, resolveUsersByRoleNames } from "../notification/notification.services";

const WORKFLOW_ROOMS = ["role_ADMIN", "role_CASHIER", "role_LAB", "role_LABORATORY", "role_STAFF", "role_DOCTOR"] as const;

export const getAllServicesController = async (
    req: Request,
    res: Response
) => {
    try {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const category =
            typeof req.query.category === "string"
                ? req.query.category
                : undefined;

        const status =
            typeof req.query.status === "string"
                ? req.query.status
                : undefined;

        const sort =
            typeof req.query.sort === "string"
                ? req.query.sort
                : undefined;

        const services =
            await getAllServices(
                page,
                limit,
                search,
                category,
                status,
                sort
            );

        return res.status(200).json({
            success: true,
            ...services,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateServiceController = async (
    req: Request,
    res: Response
) => {
    try {
        const service_id = Number(req.params.id);

        if (isNaN(service_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID",
            });
        }

        const updatedService = await updateService(
            service_id,
            req.body
        );

        const adminUserIds = await resolveUsersByRoleNames(["ADMIN"]);

        await createNotification({
            userIds: adminUserIds,
            type: "SYSTEM",
            title: "Update Services",
            message: `service ${updatedService.service_name} was updated`,
            entity: "request",
            entity_id: updatedService.service_id,
        });

        const payload = {
            ...updatedService,
            reason: "services-updated",
        };

        const io = getIO();

        io.to([...WORKFLOW_ROOMS]).emit("request:updated", payload);

        return res.status(200).json({
            success: true,
            data: updatedService,
            message: "Service updated successfully",
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
};

export const getAdminDashboardController =
    async (
        req: Request,
        res: Response
    ) => {
        try {

            const dashboard = await getAdminDashboard();

            return res.status(200).json({
                success: true,
                data: dashboard,
            });

        } catch (error: any) {

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };


// export const updateServicePriceController =
//   async (
//     req: Request,
//     res: Response
//   ) => {
//     try {

//       const service_id =
//         Number(req.params.id);

//       const { price } = req.body;

//       const service =
//         await updateServicePrice(
//           service_id,
//           Number(price)
//         );

//       return res.status(200).json({
//         success: true,
//         data: service,
//       });

//     } catch (error: any) {

//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };