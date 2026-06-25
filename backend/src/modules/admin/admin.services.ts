import { prisma } from "../../config/prismaClient";
import { Prisma, ServiceCategory } from "@prisma/client";
import { UpdateServicePayload } from "./admin.types";
import { getMonthRanges } from "./admin.helper";
import { getBillingMetrics, getLabCategoryStats, getPatientMetrics, getPaymentMethodStats, getRequestBreakdown, getRequestMetrics, getRevenueMetrics, getUserStats, getWeeklyRequests } from "./admin.metrics";

export const getAllServices = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    status?: string,
    sort?: string
) => {

    const where: Prisma.ServicesWhereInput = {};

    // SEARCH
    if (search?.trim()) {
        where.service_name = {
            contains: search,
        };
    }

    // CATEGORY
    if (category && category !== "all") {
        where.category =
            category.toUpperCase() as ServiceCategory;
    }

    if (status && status !== "all") {
        where.is_active = status === "active";
    }

    let orderBy: Prisma.ServicesOrderByWithRelationInput = {
        service_name: "asc",
    };

    switch (sort) {

        case "name_asc":
            orderBy = {
                service_name: "asc",
            };
            break;

        case "name_desc":
            orderBy = {
                service_name: "desc",
            };
            break;

        case "price_asc":
            orderBy = {
                price: "asc",
            };
            break;

        case "price_desc":
            orderBy = {
                price: "desc",
            };
            break;

        case "date_desc":
            orderBy = {
                created_at: "desc",
            };
            break;
    }

    const services =
        await prisma.services.findMany({

            where,

            skip:
                (page - 1) * limit,

            take: limit,

            orderBy,
        });

    const total =
        await prisma.services.count({
            where,
        });

    // console.log('yawa', services)

    return {
        data: services,

        pagination: {
            total,
            page,
            limit,
            totalPages:
                Math.ceil(total / limit),
        },
    };
};

export const updateService = async (
    service_id: number,
    payload: UpdateServicePayload
) => {
    const service = await prisma.services.findUnique({
        where: {
            service_id,
        },
    });

    if (!service) {
        throw new Error("Service not found");
    }

    const updatedService =
        await prisma.services.update({
            where: {
                service_id,
            },
            data: {
                service_name: payload.service_name,
                price: payload.price,
                date: payload.date
                    ? new Date(payload.date)
                    : service.date,
            },
        });

    return updatedService;
};

export const getAdminDashboard =
    async () => {

        const {
            startOfMonth,
            startOfPrevMonth,
        } = getMonthRanges();

        const [
            requestMetrics,
            patientMetrics,
            revenueMetrics,
            requestBreakdown,
            labCategoryStats,
            paymentMethods,
            billing,
            weeklyRequests,
            userStats

        ] = await Promise.all([
            getRequestMetrics(
                startOfMonth,
                startOfPrevMonth
            ),

            getPatientMetrics(
                startOfMonth,
                startOfPrevMonth
            ),

            getRevenueMetrics(
                startOfMonth,
                startOfPrevMonth
            ),

            getRequestBreakdown(),

            getLabCategoryStats(),

            getPaymentMethodStats(),

            getBillingMetrics(
                startOfMonth,
                startOfPrevMonth
            ),

            getWeeklyRequests(),
            getUserStats()
        ]);

        return {
            requests: requestMetrics,

            patients: patientMetrics,

            revenue: revenueMetrics,

            requestTypeBreakdown:
                requestBreakdown,

            labCategoryStats,

            paymentMethods,

            billing,
            weeklyRequests,
            userStats


        };
    };

// export const getServiceById = async (
//     service_id: number
// ) => {
//     return prisma.services.findUnique({
//         where: {
//             service_id,
//         },
//     });
// };

// export const createService = async (
//     payload: CreateServicePayload
// ) => {
//     return prisma.services.create({
//         data: {
//             reference_id: payload.reference_id,
//             service_name: payload.service_name,
//             price: payload.price,
//             date: payload.date
//                 ? new Date(payload.date)
//                 : new Date(),
//         },
//     });
// };

// export const updateServicePrice = async (
//     service_id: number,
//     price: number
// ) => {

//     const service =
//         await prisma.services.findUnique({
//             where: {
//                 service_id,
//             },
//         });

//     if (!service) {
//         throw new Error("Service not found");
//     }

//     return prisma.services.update({
//         where: {
//             service_id,
//         },
//         data: {
//             price,
//         },
//     });
// };

// export const deleteService = async (
//     service_id: number
// ) => {

//     const service =
//         await prisma.services.findUnique({
//             where: {
//                 service_id,
//             },
//         });

//     if (!service) {
//         throw new Error("Service not found");
//     }

//     await prisma.services.delete({
//         where: {
//             service_id,
//         },
//     });

//     return {
//         success: true,
//     };
// };