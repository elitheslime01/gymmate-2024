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

dotenv.config()

const app = express()

// CORS configuration for Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || '*'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

export default app;
