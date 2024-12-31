import mongoose from "mongoose";

const prioritySchema = new mongoose.Schema({
    _studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // Reference to the Student model
        required: true,
    },
    _unsuccessfulAttempts: {
        type: Number,
        default: 0,
    },
    _noShows: {
        type: Number,
        default: 0, 
    },
    _attendedSlots: {
        type: Number,
        default: 0, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Priority = mongoose.model("Priority", prioritySchema);

export default Priority;