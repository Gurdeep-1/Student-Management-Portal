import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import * as authCtrl from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authCtrl.register);
router.post("/login", loginRateLimiter, authCtrl.login);
router.post("/logout", verifyToken, authCtrl.logout);
router.get("/me", verifyToken, authCtrl.me);

export default router;
