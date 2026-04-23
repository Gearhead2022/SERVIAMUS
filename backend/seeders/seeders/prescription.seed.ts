import { PrismaClient } from "@prisma/client";

export async function seedPrescriptions(prisma: PrismaClient) {
    const consultations = await prisma.consultation.findMany();
    const doctors = await prisma.users.findMany({
        where: {
            roles: {
                some: {
                    role: {
                        role_name: "DOCTOR"
                    }
                }
            }
        },
    });


    if (consultations.length < 3 || doctors.length === 0) {
        throw new Error("حتاج at least 3 consultations and 1 doctor.");
    }

    const prescriptions = [];

    for (let i = 0; i < 3; i++) {
        const c = consultations[i];

        const prescription = await prisma.prescription.create({
            data: {
                consultation_id: c.consultation_id,
                patient_id: c.patient_id,
                doctor_id: doctors[0].user_id,

                gen_notes: [
                    "Take medications after meals",
                    "Avoid stress and get enough rest",
                    "Increase fluid intake",
                ][i],

                medicines: {
                    create: [
                        {
                            medicine_name: ["Paracetamol", "Ibuprofen", "Omeprazole"][i],
                            strength: ["500mg", "200mg", "20mg"][i],
                            form: "Tablet",
                            dose: "1 tablet",
                            frequency: ["Every 6 hours", "Every 8 hours", "Once daily"][i],
                            route: "Oral",
                            duration: ["5 days", "3 days", "14 days"][i],
                            quantity: ["10", "6", "14"][i],
                            instruction: "Take with water",
                        },
                        {
                            medicine_name: "Vitamin C",
                            strength: "500mg",
                            form: "Tablet",
                            dose: "1 tablet",
                            frequency: "Once daily",
                            route: "Oral",
                            duration: "7 days",
                            quantity: "7",
                            instruction: "After meals",
                        },
                    ],
                },
            },
        });

        prescriptions.push(prescription);
    }

    return prescriptions;
}