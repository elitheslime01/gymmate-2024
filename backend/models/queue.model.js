import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
    _date: {
        type: Date,
        required: true,
    },
    _timeSlot: {
        startTime: {
            type: String, // e.g., "08:00 AM"
            required: true,
        },
        endTime: {
            type: String, // e.g., "10:00 AM"
            required: true,
        },
    },
    students: [{
        _studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student", 
            required: true,
        },
        _scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule", // Reference to the Schedule model
            required: true,
        },
        _timeSlotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeSlot", // Reference to the TimeSlot model
            required: true,
        },
        _arID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AR", 
            required: true,
        },
        _priorityScore: {
            type: Number,
            required: true,
        },
        _queueStatus: {
            type: String,
            required: true,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;