import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    _startTime: {
        type: String,
        required: true,
    },
    _endTime: {
        type: String, 
        required: true,
    },
    _availableSlots: {
        type: Number,
        default: 15, 
        min: 0, 
    },
    _status: {
        type: String 
    },
    _isFullyBooked: {
        type: Boolean,
        default: false, 
    },
});

const scheduleSchema = new mongoose.Schema({
    _date: {
        type: Date,
        required: true, 
    },
    timeSlots: [timeSlotSchema],
}, {
    timestamps: true, 
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;