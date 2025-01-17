import express from "express";
import { addStudentToQueue, fetchQueues, allocateStudentsToBooking} from "../controller/queue.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Route to add a student to the queue
router.post("/add", addStudentToQueue);

// Route to fetch all queues
router.get("/get", fetchQueues);

// Route to allocate students to booking collection
router.post("/allocate", allocateStudentsToBooking);

//router.post("/allocate", allocateSlots);

const queueRoutes = router;

export default queueRoutes;