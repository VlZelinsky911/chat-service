import express from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import {
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
} from "./auth.controller.js";

const router = express.Router();

router.post("/api/auth/register", validate(registerSchema), register);
router.post("/api/auth/login", validate(loginSchema), login);
router.post("/api/auth/refresh", refresh);
router.post("/api/auth/logout", logout);
router.post("/api/auth/logout-all", authenticate, logoutAll);
router.get("/api/auth/me", authenticate, me);

export default router;
