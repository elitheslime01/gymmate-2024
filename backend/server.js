import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminsRoutes from "./routes/admin.route.js";
import scheduleRoutes from "./routes/schedule.route.js";
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
import allocationRoutes from "./routes/allocation.route.js";

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
app.use("/api/allocations", allocationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

// Catch-all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server only in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
