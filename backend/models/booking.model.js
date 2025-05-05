import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    _date: {
        type: Date,
        required: true,
    },
    _timeSlot: {
        startTime: {
            type: String, 
            required: true,
        },
        endTime: {
            type: String,
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
            ref: "Schedule", 
            required: true,
        },
        _timeSlotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeSlot", 
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
        _bookingStatus: {
            type: String,
            enum: ["Awaiting Arrival", "Checked-In", "Completed", "Cancelled", "Not Attended"],
            default: "Awaiting Arrival"
        },
        _timedIn: {
            type: Date,
            default: null
        },
        _timedOut: {
            type: Date,
            default: null
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;