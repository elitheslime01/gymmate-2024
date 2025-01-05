import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    _startTime: {
        type: String, // Use String for time representation (e.g., "08:00 AM")
        required: true,
    },
    _endTime: {
        type: String, // Use String for time representation (e.g., "10:00 AM")
        required: true,
    },
    _availableSlots: {
        type: Number,
        default: 15, // Default number of available slots
        min: 0, // Ensure it doesn't go below 0
    },
    _status: {
        type: String 
    },
    _isFullyBooked: {
        type: Boolean,
        default: false, // Indicates if the slot is fully booked
    },
});

const scheduleSchema = new mongoose.Schema({
    _date: {
        type: Date,
        required: true, // The specific date for the schedule
    },
    timeSlots: [timeSlotSchema], // Array of time slots for the date
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;