import { prisma } from "../../config/prismaClient";

export const getRevenueMetrics = async (
    startOfMonth: Date,
    startOfPrevMonth: Date
) => {

    const [
        currentRevenue,
        previousRevenue
    ] = await Promise.all([
        prisma.payment.aggregate({
            where: {
                payment_date: {
                    gte: startOfMonth,
                },
            },
            _sum: {
                amount: true,
            },
        }),

        prisma.payment.aggregate({
            where: {
                payment_date: {
                    gte: startOfPrevMonth,
                    lt: startOfMonth,
                },
            },
            _sum: {
                amount: true,
            },
        }),
    ]);

    const current =
        Number(currentRevenue._sum.amount ?? 0);

    const previous =
        Number(previousRevenue._sum.amount ?? 0);

    const revenueDelta = current - previous;

    return {
        current,
        previous,
        revenueDelta,

        revenueDeltaPct:
            previous > 0
                ? Number(
                    (
                        (revenueDelta / previous) * 100
                    ).toFixed(1)
                )
                : 0,
    };
};

export const getPatientMetrics = async (
    startOfMonth: Date,
    startOfPrevMonth: Date
) => {

    const [
        total,
        currentMonth,
        previousMonth,
    ] = await Promise.all([
        prisma.patients.count(),

        prisma.patients.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                },
            },
        }),

        prisma.patients.count({
            where: {
                created_at: {
                    gte: startOfPrevMonth,
                    lt: startOfMonth,
                },
            },
        }),
    ]);

    const patientDelta =
        currentMonth - previousMonth;

    return {
        total,
        patientDelta,

        patientDeltaPct:
            previousMonth > 0
                ? Number(
                    (
                        (patientDelta / previousMonth) *
                        100
                    ).toFixed(1)
                )
                : 0,
    };
};

export const getRequestMetrics = async (
    startOfMonth: Date,
    startOfPrevMonth: Date
) => {

    const [
        total,
        serving,
        pending,
        done,
        cancelled,

        currentMonth,
        previousMonth,
    ] = await Promise.all([

        prisma.request.count(),

        prisma.request.count({
            where: {
                status: "SERVING",
            },
        }),

        prisma.request.count({
            where: {
                status: "WAITING",
            },
        }),

        prisma.request.count({
            where: {
                status: "DONE",
            },
        }),

        prisma.request.count({
            where: {
                status: "CANCELED",
            },
        }),

        prisma.request.count({
            where: {
                req_date: {
                    gte: startOfMonth,
                },
            },
        }),

        prisma.request.count({
            where: {
                req_date: {
                    gte: startOfPrevMonth,
                    lt: startOfMonth,
                },
            },
        }),
    ]);

    const delta =
        currentMonth - previousMonth;

    return {
        total,
        serving,
        pending,
        done,
        cancelled,

        requestDelta: delta,

        requestDeltaPct:
            previousMonth > 0
                ? Number(
                    (
                        (delta / previousMonth) *
                        100
                    ).toFixed(1)
                )
                : 0,
    };
};

export const getRequestBreakdown =
    async () => {

        const breakdown =
            await prisma.request.groupBy({
                by: ["req_type"],
                _count: {
                    req_type: true,
                },
            });

        const total =
            breakdown.reduce(
                (sum, row) =>
                    sum + row._count.req_type,
                0
            );

        return breakdown.map((row) => ({
            label: row.req_type,
            value: row._count.req_type,

            pct: Number(
                (
                    (row._count.req_type /
                        total) *
                    100
                ).toFixed(1)
            ),
        }));
    };

export const getPaymentMethodStats =
    async () => {

        const payments =
            await prisma.payment.findMany({
                select: {
                    amount: true,
                    method: true,
                },
            });

        const stats = {
            CASH: 0,
            GCASH: 0,
            CARD: 0,
            BANK_TRANSFER: 0,
        };

        payments.forEach((payment) => {
            stats[payment.method] +=
                Number(payment.amount);
        });

        return stats;
    };

export const getLabCategoryStats =
    async () => {

        const tests =
            await prisma.laboratoryRequestItem.findMany({
                include: {
                    test: true,
                },
            });

        const map =
            new Map<string, number>();

        tests.forEach((item) => {

            const category =
                item.test.category ??
                "OTHER";

            map.set(
                category,
                (map.get(category) ?? 0) + 1
            );
        });

        return Array.from(
            map.entries()
        ).map(([label, count]) => ({
            label,
            count,
        }));
    };

export const getBillingMetrics = async (
    startOfMonth: Date,
    startOfPrevMonth: Date
) => {

    const [
        totalBilling,
        paidBilling,
        pendingBilling,

        currentRevenue,
        previousRevenue,

        previousMonthBilling,
        previousMonthCollected,
    ] = await Promise.all([

        prisma.billing.aggregate({
            _sum: {
                total_price: true,
            },
        }),

        prisma.billing.aggregate({
            where: {
                status: "DONE",
            },
            _sum: {
                total_price: true,
            },
        }),

        prisma.billing.aggregate({
            where: {
                status: "PENDING",
            },
            _sum: {
                total_price: true,
            },
        }),

        prisma.payment.aggregate({
            where: {
                payment_date: {
                    gte: startOfMonth,
                },
            },
            _sum: {
                amount: true,
            },
        }),

        prisma.payment.aggregate({
            where: {
                payment_date: {
                    gte: startOfPrevMonth,
                    lt: startOfMonth,
                },
            },
            _sum: {
                amount: true,
            },
        }),

        prisma.billing.aggregate({
            where: {
                date: {
                    gte: startOfPrevMonth,
                    lt: startOfMonth,
                },
            },
            _sum: {
                total_price: true,
            },
        }),

        prisma.billing.aggregate({
            where: {
                status: "DONE",
                date: {
                    gte: startOfPrevMonth,
                    lt: startOfMonth,
                },
            },
            _sum: {
                total_price: true,
            },
        }),
    ]);

    const totalBilled =
        Number(totalBilling._sum.total_price ?? 0);

    const totalCollected =
        Number(paidBilling._sum.total_price ?? 0);

    const totalPending =
        Number(pendingBilling._sum.total_price ?? 0);

    const currentRevenueAmount =
        Number(currentRevenue._sum.amount ?? 0);

    const previousRevenueAmount =
        Number(previousRevenue._sum.amount ?? 0);

    const revenueDelta =
        currentRevenueAmount -
        previousRevenueAmount;

    const revenueDeltaPct =
        previousRevenueAmount > 0
            ? Number(
                (
                    (revenueDelta /
                        previousRevenueAmount) *
                    100
                ).toFixed(1)
            )
            : 0;

    const currentCollectionRate =
        totalBilled > 0
            ? Number(
                (
                    (totalCollected /
                        totalBilled) *
                    100
                ).toFixed(2)
            )
            : 0;

    const previousBilled =
        Number(
            previousMonthBilling._sum.total_price ?? 0
        );

    const previousCollected =
        Number(
            previousMonthCollected._sum.total_price ?? 0
        );

    const previousCollectionRate =
        previousBilled > 0
            ? Number(
                (
                    (previousCollected /
                        previousBilled) *
                    100
                ).toFixed(2)
            )
            : 0;

    const collectionRateDelta =
        Number(
            (
                currentCollectionRate -
                previousCollectionRate
            ).toFixed(2)
        );

    const collectionRateDeltaPct =
        previousCollectionRate > 0
            ? Number(
                (
                    (collectionRateDelta /
                        previousCollectionRate) *
                    100
                ).toFixed(1)
            )
            : 0;

    return {
        totalBilled,
        totalCollected,
        totalPending,

        revenueDelta,
        revenueDeltaPct,

        collectionRate:
            currentCollectionRate,

        previousCollectionRate,

        collectionRateDelta,

        collectionRateDeltaPct,
    };
};

export const getWeeklyRequests = async () => {

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const startDate = new Date();

    startDate.setDate(
        startDate.getDate() - 6
    );

    startDate.setHours(0, 0, 0, 0);

    const requests =
        await prisma.request.findMany({
            where: {
                req_date: {
                    gte: startDate,
                },
            },
            select: {
                req_date: true,
                req_type: true,
            },
        });

    const weekly = days.map((day) => ({
        day,
        consultation: 0,
        lab: 0,
        cert: 0,
    }));

    requests.forEach((request) => {

        const dayIndex =
            new Date(request.req_date).getDay();

        if (
            request.req_type === "CONSULTATION"
        ) {
            weekly[dayIndex].consultation++;
        }

        if (
            request.req_type === "LABORATORY"
        ) {
            weekly[dayIndex].lab++;
        }

        if (
            request.req_type === "CERTIFICATE"
        ) {
            weekly[dayIndex].cert++;
        }
    });

    return weekly;
};


export const getUserStats = async () => {

    const users = await prisma.users.findMany({
        include: {
            roles: {
                include: {
                    role: true,
                },
            },
        },
    });

    const map = new Map<
        string,
        {
            count: number;
            active: number;
        }
    >();

    users.forEach((user) => {

        user.roles.forEach((userRole) => {

            const roleName =
                userRole.role.role_name;

            const current =
                map.get(roleName) ?? {
                    count: 0,
                    active: 0,
                };

            current.count++;

            if (user.is_active) {
                current.active++;
            }

            map.set(
                roleName,
                current
            );
        });
    });

    return Array.from(
        map.entries()
    ).map(([role, stats]) => ({
        role,
        count: stats.count,
        active: stats.active,
    }));
};