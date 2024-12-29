import mongoose from "mongoose";

const arSchema = new mongoose.Schema({
    _code: {
        type: String,
        required: true
    },
    _dateSubmitted: {
        type: Date,
        required: true
    },
    _status: {
        type: String,
        required: true
    },
    _studentID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student", 
        required: true 
    }
}, {
    timestamps: true
});

const AR = mongoose.model("AR", arSchema);

export default AR