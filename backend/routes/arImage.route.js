import express from "express";
import { uploadARImage, getARImage } from "../controller/arImage.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/upload", upload.fields([{ name: "_arImage", maxCount: 1 }, { name: "_studentId", maxCount: 1 }]), uploadARImage);

router.get("/:studentID", getARImage);

const arImageRoutes = router;

export default arImageRoutes;