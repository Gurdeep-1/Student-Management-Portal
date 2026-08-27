import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as ctrl from "../controllers/users.controller.js";

const router = Router();

// All routes require admin role
router.use(verifyToken, requireRole("admin"));

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
