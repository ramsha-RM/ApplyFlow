import { body, param, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required!")
    .isLength({ min: 4 })
    .withMessage("Name must be at least 4 characters!"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email!")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters!"),

  body("role")
  .optional()
  .isIn(["candidate", "employer", "admin"])
  .withMessage("Invalid role"),

  body("company").optional().trim(),
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Old password is required!"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];

export const jobValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required"),

  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("requirements")
    .isArray({ min: 1 })
    .withMessage("At least one requirement is required"),

  body("location").optional().trim(),

  body("jobType").optional().trim(),

  body("experienceLevel").optional().trim(),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Invalid deadline"),
];

export const jobIdValidator = [param("jobId").isMongoId().withMessage("Invalid Job ID")];

export const applicationIdValidator = [param("id").isMongoId().withMessage("Invalid ID")];

export const applicationApplyValidator = [
  body("resume")
    .optional()
    .isString()
    .withMessage("Resume must be a string"),

  body("coverLetter")
    .optional()
    .isString()
    .withMessage("Cover letter must be text")
    .isLength({ max: 5000 })
    .withMessage("Cover letter must be 5000 characters or fewer"),
];

export const applicationStatusValidator = [
  body("status")
    .trim()
    .isIn(["Pending", "Accepted", "Rejected"])
    .withMessage("Invalid application status"),
];

export const idValidator = [param("id").isMongoId().withMessage("Invalid ID")];
