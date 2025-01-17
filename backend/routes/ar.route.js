import express from "express";
import { uploadAR, checkAR } from "../controller/ar.controller.js";

const router = express.Router();

// Route for uploading image
router.post("/uploadAR", uploadAR);

// Route for checking ar code
router.post("/checkAR", checkAR);

const arRoutes = router;

export default arRoutes;