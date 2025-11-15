import express from "express";
import {
  listFeedback,
  createFeedback,
  deleteFeedback,
} from "../controller/feedback.controller.js";

const router = express.Router();

router.get("/", listFeedback);
router.post("/", createFeedback);
router.delete("/:id", deleteFeedback);

const feedbackRoutes = router;

export default feedbackRoutes;
