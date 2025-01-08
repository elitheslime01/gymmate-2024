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
import multer from './utils/multer.js';
import arImageRoutes from "./routes/arImage.route.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer.single('_arImage')); // Use Multer for file uploads

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/public', express.static(path.join(__dirname, '../public'))); // Serve static files

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
//app.use("/api/arImage", arImageRoutes);

app.use("/api/arImage", multer.single('_arImage'), arImageRoutes);
