// backend/src/modules/queue/queue.controller.ts

import { Request, Response } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  addToQueue,
  getQueueByType,
  getServingPatient,
  moveToNextQueue,
  skipQueue,
  getAllQueues,
} from "./queue.services";

export const addToQueueController = async (req: Request, res: Response) => {
  try {
    const { patient_id, queue_type } = req.body;

    if (!patient_id || !queue_type) {
      return res.status(400).json({
        success: false,
        message: "patient_id and queue_type are required",
      });
    }

    if (!["CONSULTATION", "LABORATORY"].includes(queue_type)) {
      return res.status(400).json({
        success: false,
        message: "queue_type must be CONSULTATION or LABORATORY",
      });
    }

    const queue = await addToQueue(patient_id, queue_type);

    return res.status(201).json({
      success: true,
      data: queue,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQueueByTypeController = async (req: Request, res: Response) => {
  try {
    const queue_type = Array.isArray(req.params.queue_type)
      ? req.params.queue_type[0]
      : req.params.queue_type;

    if (!["CONSULTATION", "LABORATORY"].includes(queue_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid queue_type",
      });
    }

    const queues = await getQueueByType(
      queue_type as "CONSULTATION" | "LABORATORY"
    );

    return res.status(200).json({
      success: true,
      data: queues,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getServingPatientController = async (
  req: Request,
  res: Response
) => {
  try {
    const queue_type = Array.isArray(req.params.queue_type)
      ? req.params.queue_type[0]
      : req.params.queue_type;

    if (!["CONSULTATION", "LABORATORY"].includes(queue_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid queue_type",
      });
    }

    const serving = await getServingPatient(
      queue_type as "CONSULTATION" | "LABORATORY"
    );

    return res.status(200).json({
      success: true,
      data: serving,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const moveToNextQueueController = async (
  req: Request,
  res: Response
) => {
  try {
    const queue_type = Array.isArray(req.params.queue_type)
      ? req.params.queue_type[0]
      : req.params.queue_type;

    if (!["CONSULTATION", "LABORATORY"].includes(queue_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid queue_type",
      });
    }

    const nextPatient = await moveToNextQueue(
      queue_type as "CONSULTATION" | "LABORATORY"
    );

    return res.status(200).json({
      success: true,
      data: nextPatient,
      message: nextPatient
        ? `Patient ${nextPatient.queue_number} now serving`
        : "No more patients in queue",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const skipQueueController = async (req: Request, res: Response) => {
  try {
    const queue_id = Array.isArray(req.params.queue_id)
      ? parseInt(req.params.queue_id[0])
      : parseInt(req.params.queue_id);

    const skipped = await skipQueue(queue_id);

    return res.status(200).json({
      success: true,
      data: skipped,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllQueuesController = async (req: Request, res: Response) => {
  try {
    const queues = await getAllQueues();

    return res.status(200).json({
      success: true,
      data: queues,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};