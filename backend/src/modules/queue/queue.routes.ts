// backend/src/modules/queue/queue.routes.ts
import { Request, Response } from "express";
import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  addToQueueController,
  getQueueByTypeController,
  getServingPatientController,
  moveToNextQueueController,
  skipQueueController,
  getAllQueuesController,
} from "./queue.controller";

const router = Router();

// Add patient to queue (STAFF only)
router.post("/add", authorize(["STAFF"]), addToQueueController);

// Get all queues by type
router.get("/type/:queue_type", getQueueByTypeController);

// Get currently serving patient
router.get("/serving/:queue_type", getServingPatientController);

// Move to next patient in queue (STAFF only)
router.put("/next/:queue_type", authorize(["STAFF"]), moveToNextQueueController);

// Skip a patient (STAFF only)
router.put("/skip/:queue_id", authorize(["STAFF"]), skipQueueController);

// Get all active queues
router.get("/", getAllQueuesController);
// Reset all queues (STAFF only)
router.delete("/reset", authorize(["STAFF"]), async (req: Request, res: Response) => {
  try {
    const { prisma } = require("../../config/prismaClient");
    await prisma.queue.deleteMany({});
    
    return res.status(200).json({
      success: true,
      message: "All queues have been reset",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


export default router;