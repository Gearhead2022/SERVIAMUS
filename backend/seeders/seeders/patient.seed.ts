import { PrismaClient } from "@prisma/client";

export async function seedPatients(prisma: PrismaClient) {
    await prisma.patients.createMany({
        data: [
            {
                patient_code: "P00001",
                name: "Juan Dela Cruz",
                address: "Bata Bacolod City",
                contact_number: "09123456789",
                birth_date: new Date("1998-06-01"),
                sex: "male",
                religion: "Catholic",
                age: 22
            },
            {
                patient_code: "P00002",
                name: "John Xyryl Pedrosa",
                address: "Taculing Bacolod City",
                contact_number: "09123456789",
                birth_date: new Date("1999-08-22"),
                sex: "male",
                religion: "Catholic",
                age: 22
            },
            {
                patient_code: "P00003",
                name: "Christian Loyd Magtolis",
                address: "Mansilingan Bacolod City",
                contact_number: "09123456789",
                birth_date: new Date("1999-08-22"),
                sex: "male",
                religion: "Catholic",
                age: 22
            },
        ],
        skipDuplicates: true,
    });
}