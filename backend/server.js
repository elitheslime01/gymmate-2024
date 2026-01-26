import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminsRoutes from "./routes/admin.route.js";
import scheduleRoutes from "./routes/schedule.route.js"; // Import the schedule routes
import cors from 'cors';
import studentsRoutes from "./routes/student.route.js";
import arRoutes from "./routes/ar.route.js";
import queueRoutes from "./routes/queue.route.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path'
import path from 'path';
import arImageRoutes from "./routes/arImage.route.js";
import bookingRoutes from "./routes/booking.route.js";
import feedbackRoutes from "./routes/feedback.route.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});

// app.use((req, res, next) => {
//     console.log('Request Method:', req.method);
//     console.log('Request URL:', req.url);
//     console.log('Request Body:', req.body);
//     console.log('Request Files:', req.file);
//     next();
// });

app.use(cors());
app.use("/api/admins", adminsRoutes)
app.use("/api/schedules", scheduleRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/ARCodes", arRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/arImage", arImageRoutes);
app.use("/api/feedback", feedbackRoutes);

// Catch-all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
