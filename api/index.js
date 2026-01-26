// Imports
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "../backend/config/db.js";
import adminsRoutes from "../backend/routes/admin.route.js";
import scheduleRoutes from "../backend/routes/schedule.route.js";
import cors from 'cors';
import studentsRoutes from "../backend/routes/student.route.js";
import arRoutes from "../backend/routes/ar.route.js";
import queueRoutes from "../backend/routes/queue.route.js";
import arImageRoutes from "../backend/routes/arImage.route.js";
import bookingRoutes from "../backend/routes/booking.route.js";
import feedbackRoutes from "../backend/routes/feedback.route.js";

// Environment Configuration
dotenv.config()

// CORS Setup
const corsOptions = {
  origin: [
    'https://gymmate-2024.vercel.app',
    'http://localhost:5000'
  ],
  credentials: true
};

// App Initialization
const app = express()

// Middleware Setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// API Routes
app.use("/api/admins", adminsRoutes)
app.use("/api/schedules", scheduleRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/ARCodes", arRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/arImage", arImageRoutes);
app.use("/api/feedback", feedbackRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

// Export
export default app;
