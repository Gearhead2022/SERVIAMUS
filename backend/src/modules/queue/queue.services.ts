// backend/src/modules/queue/queue.services.ts

import { RequestType } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { Prisma } from "@prisma/client";

type NonCertificateRequestType = Exclude<RequestType, "CERTIFICATE">

export const addToQueue = async (tx: Prisma.TransactionClient, patient_id: number, req_id: number, req_date: string, queue_type: NonCertificateRequestType) => {

  const lastQueue = await tx.queue.findFirst({
    where: { queue_type, status: { in: ["WAITING", "SERVING"] } },
    orderBy: { queue_number: "desc" },
  });

  const nextQueueNumber = (lastQueue?.queue_number || 0) + 1;

  const queue = await tx.queue.create({
    data: {
      patient_id,
      req_id,
      queue_type,
      queue_number: nextQueueNumber,
      status: "WAITING",
      req_date: new Date(req_date)
    },
    include: {
      patient: true,
    },
  });

  return queue;
};

export const getQueueByType = async (queue_type: "CONSULTATION" | "LABORATORY") => {
  const queues = await prisma.queue.findMany({
    where: {
      queue_type,
      status: { in: ["WAITING", "SERVING"] },
    },
    include: {
      patient: true,
    },
    orderBy: { queue_number: "asc" },
  });

  return queues;
};

export const getServingPatient = async (queue_type: "CONSULTATION" | "LABORATORY") => {
  const serving = await prisma.queue.findFirst({
    where: {
      queue_type,
      status: "SERVING",
    },
    include: {
      patient: true,
    },
  });

  return serving;
};

export const moveToNextQueue = async (queue_type: "CONSULTATION" | "LABORATORY") => {
  // Mark current serving as completed
  await prisma.queue.updateMany({
    where: {
      queue_type,
      status: "SERVING",
    },
    data: {
      status: "COMPLETED",
      completed_at: new Date(),
    },
  });

  // Get next waiting patient
  const nextPatient = await prisma.queue.findFirst({
    where: {
      queue_type,
      status: "WAITING",
    },
    orderBy: { queue_number: "asc" },
    include: {
      patient: true,
    },
  });

  // Mark as serving
  if (nextPatient) {
    await prisma.queue.update({
      where: { queue_id: nextPatient.queue_id },
      data: {
        status: "SERVING",
        serving_at: new Date(),
      },
      include: {
        patient: true,
      },
    });
  }

  return nextPatient;
};

export const skipQueue = async (queue_id: number) => {
  return prisma.queue.update({
    where: { queue_id },
    data: { status: "SKIPPED" },
    include: {
      patient: true,
    },
  });
};

export const getAllQueues = async () => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const queues = await prisma.queue.findMany({
    where: {
      status: { in: ["WAITING", "SERVING"] },
      req_date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      patient: true,
    },
    orderBy: [
      { queue_type: "asc" },
      { queue_number: "asc" },
    ],
  });

  return queues;
};