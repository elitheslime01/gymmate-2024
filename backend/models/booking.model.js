import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
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
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;