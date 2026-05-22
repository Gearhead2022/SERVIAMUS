import { PrismaClient } from "@prisma/client";

export async function seedPrescriptions(prisma: PrismaClient) {
    // 1. Get dependencies (VERY IMPORTANT)
    const consultation = await prisma.consultation.findFirst();
    const patient = await prisma.patients.findFirst();

    // Find doctor (based on role)
    const doctorRole = await prisma.roleTypes.findFirst({
        where: { role_name: "DOCTOR" },
        include: {
            users: {
                include: {
                    user: true,
                },
            },
        },
    });

    const doctor = doctorRole?.users[0]?.user;

    if (!consultation || !patient || !doctor) {
        throw new Error("Missing dependency for prescription seeding");
    }

    // 2. Create Prescription
    const prescription = await prisma.prescription.create({
        data: {
            consultation_id: consultation.consultation_id,
            patient_id: patient.patient_id,
            doctor_id: doctor.user_id,
            gen_notes: "Take medications as prescribed",
            issued_date: new Date(),
        },
    });

    // 3. Create Prescription Items
    await prisma.prescriptionItem.createMany({
        data: [
            {
                presc_id: prescription.presc_id,
                medicine_name: "Paracetamol",
                strength: "500mg",
                form: "Tablet",
                dose: "1 tab",
                frequency: "3x a day",
                route: "Oral",
                duration: "5 days",
                quantity: "15",
                instruction: "After meals",
            },
            {
                presc_id: prescription.presc_id,
                medicine_name: "Amoxicillin",
                strength: "500mg",
                form: "Capsule",
                dose: "1 cap",
                frequency: "3x a day",
                route: "Oral",
                duration: "7 days",
                quantity: "21",
                instruction: "Finish all antibiotics",
            },
        ],
    });

    console.log("✅ Prescription seeded");
}