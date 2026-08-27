import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import * as dashCtrl from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", verifyToken, dashCtrl.getDashboard);

export default router;
