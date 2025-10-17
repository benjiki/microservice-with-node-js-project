import { Router } from "express";

import * as authController from "./authController";
import { validateRequest } from "../../../shared/middleware";
import { loginSchema, refreshTokenSchema, registerSchema } from "./validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);
router.post(
  "/logout",
  validateRequest(refreshTokenSchema),
  authController.logout
);

// Token validation endpoint (for other services to validate tokens)
router.post("/validate-token", authController.validateToken);

// Protected route
router.get("/profile", authController.getProfile);
router.delete("/delete-account", authController.deleteAccount);
export default router;
