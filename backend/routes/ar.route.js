import express from "express";
import { uploadAR, checkAR } from "../controller/ar.controller.js";

const router = express.Router();

router.post("/uploadAR", uploadAR);
router.post("/checkAR", checkAR);

const arRoutes = router;

export default arRoutes;