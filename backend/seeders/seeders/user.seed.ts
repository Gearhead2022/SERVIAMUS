import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
    const roles = await prisma.roleTypes.findMany();

    const hash = async (password: string) => {
        return await bcrypt.hash(password, 10);
    };

    const roleMap = Object.fromEntries(
        roles.map((r) => [r.role_name, r.role_id])
    );

    const doctor1 = await prisma.users.create({
        data: {
            name: "Dr. John Xyryl Pedrosa",
            username: "doctor1",
            password: await hash("doctor1"),
        },
    });

    const doctor2 = await prisma.users.create({
        data: {
            name: "Dr. Kim Janrey Ramos MD. Phd",
            username: "doctor2",
            password: await hash("doctor2"),
        },
    });

    const staff1 = await prisma.users.create({
        data: {
            name: "Maria Ortega",
            username: "staff1",
            password: await hash("staff1"),
        },
    });

    const admin1 = await prisma.users.create({
        data: {
            name: "John Rhee parreno",
            username: "admin",
            password: await hash("admin"),
        },
    });

    const cashier1 = await prisma.users.create({
        data: {
            name: "Romelo Panigon",
            username: "cashier1",
            password: await hash("cashier1"),
        },
    });

    await prisma.userRole.createMany({
        data: [
            {
                user_id: doctor1.user_id,
                role_id: roleMap["DOCTOR"],
            },
            {
                user_id: doctor2.user_id,
                role_id: roleMap["DOCTOR"],
            },
            {
                user_id: staff1.user_id,
                role_id: roleMap["STAFF"],
            },
            {
                user_id: admin1.user_id,
                role_id: roleMap["ADMIN"],
            },
            {
                user_id: cashier1.user_id,
                role_id: roleMap["CASHIER"],
            },
        ]
    });

    return { doctor1, doctor2, staff1, admin1 };
}