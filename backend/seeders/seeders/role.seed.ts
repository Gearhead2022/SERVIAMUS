import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient) {
    await Promise.all(
        ["ADMIN", "DOCTOR", "LAB", "STAFF", "CASHIER", "ENCODER", "PATHOLOGIST"].map(
            (role_name) =>
                prisma.roleTypes.upsert({
                    where: { role_name },
                    update: {},
                    create: { role_name },
                })
        )
    );
}
