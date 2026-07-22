import express from 'express';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { jobValidator, validate, idValidator } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/', protect, authorize("employer"), jobValidator, validate, createJob);
router.get('/', protect, getAllJobs);
router.get('/:id', protect, idValidator, validate, getJobById);
router.put('/:id', protect, authorize("employer"), idValidator, jobValidator, validate, updateJob);
router.delete('/:id', protect, authorize("employer"), idValidator, validate, deleteJob);

export default router;