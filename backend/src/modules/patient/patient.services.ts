import { prisma } from "../../config/prismaClient";
import { PatientPayload } from "../patient/patient.types";

/**
 * GET ALL PATIENT
 */

export const getAllPatients = async (search? :string) => {

  const patients = await prisma.patients.findMany({
    where: search
      ? {
          OR: [
            {
              patient_code: {
                contains: search,
              },
            },
            {
              name: {
                contains: search,
              },
            },
          ],
        }
      : undefined,
  });

  return patients;
};
/**
 * REGISTER PATIENT
 */
export const addPatient = async (payload: PatientPayload) => {
  return prisma.$transaction(async (tx) => {
    const patient = await tx.patients.create({
      data: {
        name: payload.name,
        address: payload.address,
        contact_number: payload.contact_number,
        birth_date: new Date(payload.birth_date),
        sex: payload.sex as "male" | "female",
        age: payload.age,
        religion: payload.religion,
      },
    });

    const patientCode = `P${patient.patient_id.toString().padStart(5, "0")}`;

    const updatedPatient = await tx.patients.update({
      where: { patient_id: patient.patient_id },
      data: { patient_code: patientCode },
    });

    return updatedPatient;
  });
};