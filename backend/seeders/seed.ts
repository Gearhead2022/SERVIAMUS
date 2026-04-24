import { PrismaClient } from "@prisma/client";

import { seedRoles } from "./seeders/role.seed";
import { seedUsers } from "./seeders/user.seed";
import { seedPatients } from "./seeders/patient.seed";
import { seedVitals } from "./seeders/vital.seed";
import { seedConsultations } from "./seeders/consultation.seed";
import { seedLaboratory } from "./seeders/laboratory.seed";
import { seedConsultationRecords } from "./seeders/records.seed";
import { seedMedicalCertificateRequest } from "./seeders/medical.seed";
import { seedPrescriptions } from "./seeders/prescription.seed";

const prisma = new PrismaClient();

async function main() {
    await seedRoles(prisma);
    await seedUsers(prisma);
    await seedPatients(prisma);
    await seedVitals(prisma);
    await seedConsultations(prisma);
    await seedLaboratory(prisma);
    await seedConsultationRecords(prisma);
    await seedMedicalCertificateRequest(prisma);
    await seedPrescriptions(prisma);

    console.log("Full database seeded");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());