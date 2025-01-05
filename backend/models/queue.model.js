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
<<<<<<< HEAD
        // _arImageID: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "ARImage", 
        //     required: true,
        // },
=======
>>>>>>> parent of 4eb965c (feat: update code multipart)
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;