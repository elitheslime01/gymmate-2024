import express from "express";
import { createStudent, loginStudent, logoutStudent, getStudents, updateStudent, deleteStudent } from "../controller/student.controller.js";

const router = express.Router();

// Route for creating a new student
router.post("/", createStudent);

// Route for listing all students
router.get("/", getStudents);

// Route for updating a student
router.put("/:id", updateStudent);

// Route for deleting a student
router.delete("/:id", deleteStudent);

// Route for logging in a new student
router.post("/login", loginStudent);

// Route for logging out a new student
router.post("/logout", logoutStudent);

const studentsRoutes = router;

export default studentsRoutes;