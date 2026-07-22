import express from "express";
import { register, login, getMe, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validate,
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../middleware/validation.middleware.js";
const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);
router.put(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword,
);

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
