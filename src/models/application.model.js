import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
    },
    resume: {
      type: String,
      trim: true,
      default: "",
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Accepted", "Rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
