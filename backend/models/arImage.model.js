import mongoose from "mongoose";

const arImageSchema = new mongoose.Schema({
  _studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  _arImage: {
    type: Buffer,
    required: true,
  },
  _contentType: {
    type: String,
    required: true,
  },
});

const ARImage = mongoose.model("ARImage", arImageSchema);

export default ARImage;