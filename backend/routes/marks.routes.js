import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as ctrl from "../controllers/marks.controller.js";

const router = Router();

router.get("/", verifyToken, ctrl.getAll);
router.get("/:id", verifyToken, ctrl.getById);
router.post("/", verifyToken, requireRole("faculty", "admin"), ctrl.create);
router.put("/:id", verifyToken, requireRole("faculty", "admin"), ctrl.update);
router.delete("/:id", verifyToken, requireRole("faculty", "admin"), ctrl.remove);

export default router;
