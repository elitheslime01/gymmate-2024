import express from "express";
import { uploadAR } from "../controller/ar.controller.js";

const router = express.Router();

router.post("/", uploadAR);

const arRoutes = router;

export default arRoutes;