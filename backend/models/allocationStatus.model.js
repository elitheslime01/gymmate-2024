import mongoose from "mongoose";

const allocationStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    status: {
      type: String,
      enum: ["WAITING", "ALLOCATED", "FAILED"],
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AllocationStatus = mongoose.model("AllocationStatus", allocationStatusSchema);

export default AllocationStatus;
