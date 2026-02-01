import express from "express";
import { notifyAllocationStatus } from "../controller/allocation.controller.js";

const router = express.Router();

router.post("/notify", notifyAllocationStatus);

const allocationRoutes = router;

export default allocationRoutes;
