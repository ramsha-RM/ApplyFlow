import express from "express";

import {
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/application.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  validate,
  applicationApplyValidator,
  applicationIdValidator,
  applicationStatusValidator,
  jobIdValidator,
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/apply/:jobId",
  protect,
  authorize("candidate"),
  jobIdValidator,
  applicationApplyValidator,
  validate,
  applyJob,
);
router.get(
  "/my-applications",
  protect,
  authorize("candidate"),
  getMyApplications,
);
router.get(
  "/job-applicants/:jobId",
  protect,
  authorize("employer", "admin"),
  jobIdValidator,
  validate,
  getJobApplicants,
);
router.put(
  "/update-status/:id",
  protect,
  authorize("employer", "admin"),
  applicationIdValidator,
  applicationStatusValidator,
  validate,
  updateApplicationStatus,
);
router.delete(
  "/delete/:id",
  protect,
  authorize("candidate", "admin"),
  applicationIdValidator,
  validate,
  deleteApplication,
);

export default router;