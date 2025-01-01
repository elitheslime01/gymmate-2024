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
        _scheduleID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule", 
            required: true,
        },
        _arID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AR", 
            required: true,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;