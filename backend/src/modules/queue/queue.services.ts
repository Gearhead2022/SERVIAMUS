// backend/src/modules/queue/queue.services.ts

import { prisma } from "../../config/prismaClient";

export const addToQueue = async (patient_id: number, queue_type: "CONSULTATION" | "LABORATORY") => {
  // Get the next queue number for this type
  const lastQueue = await prisma.queue.findFirst({
    where: { queue_type, status: { in: ["WAITING", "SERVING"] } },
    orderBy: { queue_number: "desc" },
  });

  const nextQueueNumber = (lastQueue?.queue_number || 0) + 1;

  const queue = await prisma.queue.create({
    data: {
      patient_id,
      queue_type,
      queue_number: nextQueueNumber,
      status: "WAITING",
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
  const queues = await prisma.queue.findMany({
    where: {
      status: { in: ["WAITING", "SERVING"] },
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