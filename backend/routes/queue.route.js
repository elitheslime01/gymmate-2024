import express from "express";
import { addStudentToQueue, checkIfStudentInQueue } from "../controller/queue.controller.js";

const router = express.Router();

// Route to add a student to the queue
router.post("/add", addStudentToQueue);
router.post("/checkIfStudentInQueue", checkIfStudentInQueue);

const queueRoutes = router;

export default queueRoutes;