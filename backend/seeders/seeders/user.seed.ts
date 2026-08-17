import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
    
        // Clear existing seeded data
    await prisma.users.deleteMany();
    await prisma.userRole.deleteMany();

    
    const roles = await prisma.roleTypes.findMany();

    const hash = async (password: string) => {
        return await bcrypt.hash(password, 10);
    };

    const roleMap = Object.fromEntries(
        roles.map((r) => [r.role_name, r.role_id])
    );

    const doctor1 = await prisma.users.create({
        data: {
            name: "DR. JUNE PEARL T. SANSON",
            username: "dr_sanson",
            password: await hash("dr_sanson"),
            title: "MD., DFM, DPADP",
            ptr_no: "90501760",
            license_no: "0107334"
        },
    });

    const staff1 = await prisma.users.create({
        data: {
            name: "(Edit ME!)",
            username: "staff",
            password: await hash("staff"),
        },
    });

    const admin1 = await prisma.users.create({
        data: {
            name: "(Edit ME!)",
            username: "admin",
            password: await hash("admin"),
        },
    });

    const cashier1 = await prisma.users.create({
        data: {
            name: "(Edit ME!)",
            username: "cashier",
            password: await hash("cashier"),
        },
    });

    const lab1 = await prisma.users.create({
        data: {
            name: "(Edit ME!)",
            username: "medtech",
            password: await hash("medtech"),
        },
    });

     const encoder1 = await prisma.users.create({
        data: {
            name: "(Edit ME!)",
            username: "encoder",
            password: await hash("encoder"),
        },
    });


    await prisma.userRole.createMany({
        data: [
            {
                user_id: doctor1.user_id,
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
            {
                user_id: lab1.user_id,
                role_id: roleMap["LAB"],
            },
            {
                user_id: encoder1.user_id,
                role_id: roleMap["ENCODER"],
            },
        ]
    });

    return { doctor1, staff1, admin1, cashier1, lab1, encoder1 };
}