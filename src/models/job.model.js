import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
      maxLength: [100, "Job title cannot exceed 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    requirements: {
      type: [String],
      required: [true, "Please list required skills/qualifications"],
    },
    location: {
      type: String,
      default: "Remote",
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      default: "Full-time",
    },
    salaryRange: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Lead"],
      default: "Mid",
    },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "draft",
    },
    skills: {
      type: [String],
      benefits: [String],
      applicationUrl: String,
      isRemote: { type: Boolean, default: false },
      category: String,
      openings: {
        type: Number,
        min: 1,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: "Deadline must be a future date",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", JobSchema);
