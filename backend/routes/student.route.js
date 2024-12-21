import express from "express";
import { createStudent } from "../controller/student.controller.js";

const router = express.Router();

// Route for creating a new admin
router.post("/", createStudent);

const studentsRoutes = router;

export default studentsRoutes;