import express from "express";
import { uploadARImage, getARImage } from "../controller/arImage.controller.js";

const router = express.Router();

router.get("/:studentID", getARImage);

const arImageRoutes = router;

export default arImageRoutes;