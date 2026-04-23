import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient) {
    await prisma.roleTypes.createMany({
        data: [
            { role_name: "ADMIN" },
            { role_name: "DOCTOR" },
            { role_name: "MEDTECH" },
            { role_name: "STAFF" },
            { role_name: "CASHIER" },
        ],
        skipDuplicates: true,
    });
}