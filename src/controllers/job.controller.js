import mongoose from "mongoose";
import Job from "../models/job.model.js";

// Create Job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      location,
      jobType,
      salaryRange,
      experienceLevel,
      deadline,
    } = req.body;

    if (
      !title ||
      !company ||
      !description ||
      !Array.isArray(requirements) ||
      requirements.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, company, description and at least one requirement.",
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      requirements,
      location,
      jobType,
      salaryRange,
      experienceLevel,
      deadline,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create Job Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get Jobs Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Single Job
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get Job Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
console.log("Job ID:", job._id);
console.log("Job createdBy:", job.createdBy);
console.log("Logged-in user:", req.user._id);
console.log("Same owner:", job.createdBy.toString() === req.user._id.toString());
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update Job Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};