import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminsRoutes from "./routes/admin.route.js";
import scheduleRoutes from "./routes/schedule.route.js"; // Import the schedule routes
import cors from 'cors';
import studentsRoutes from "./routes/student.route.js";
import arRoutes from "./routes/ar.route.js";
import queueRoutes from "./routes/queue.route.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json());

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});

app.use(cors());
app.use("/api/admins", adminsRoutes)
app.use("/api/schedules", scheduleRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/ARCodes", arRoutes);
app.use("/api/queues", queueRoutes);