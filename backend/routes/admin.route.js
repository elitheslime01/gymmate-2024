import express from "express";
import { loginAdmin, logoutAdmin, createAdmin, getAdmins, updateAdmin, deleteAdmin } from "../controller/admin.controller.js";

const router = express.Router();

// Route for logging in an admin
router.post("/login", loginAdmin);

// Route for logging out an admin
router.post("/logout", logoutAdmin);

// Route for getting all admins
router.get("/", getAdmins);

// Route for creating a new admin
router.post("/", createAdmin);

// Route for updating an admin
router.put("/:id", updateAdmin);

// Route for deleting an admin
router.delete("/:id", deleteAdmin);

const adminsRoutes = router;

export default adminsRoutes;