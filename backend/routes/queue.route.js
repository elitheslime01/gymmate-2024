import express from "express";
import { addStudentToQueue } from "../controller/queue.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Route to add a student to the queue
router.post("/add", addStudentToQueue);

const queueRoutes = router;

export default queueRoutes;