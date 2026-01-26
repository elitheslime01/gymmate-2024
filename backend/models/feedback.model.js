import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  { _id: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["new", "in_review", "resolved"],
      default: "new",
      lowercase: true,
    },
    // sentiment: {
    //   type: String,
    //   enum: ["positive", "neutral", "negative"],
    //   default: null,
    //   lowercase: true,
    //   trim: true,
    // },
    // sentimentSource: {
    //   type: String,
    //   enum: ["model", "human", "imported"],
    //   default: null,
    //   lowercase: true,
    //   trim: true,
    // },
    // sentimentUpdatedAt: {
    //   type: Date,
    //   default: null,
    // },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
