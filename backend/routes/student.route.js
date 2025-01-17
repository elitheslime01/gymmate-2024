import express from "express";
import { createStudent, loginStudent, logoutStudent } from "../controller/student.controller.js";

const router = express.Router();

// Route for creating a new student
router.post("/", createStudent);

// Route for logging in a new student
router.post("/login", loginStudent);

// Route for logging out a new student
router.post("/logout", logoutStudent);

const studentsRoutes = router;

export default studentsRoutes;