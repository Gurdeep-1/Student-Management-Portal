import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import * as ctrl from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", verifyToken, ctrl.getAll);
router.get("/:id", verifyToken, ctrl.getById);
router.post("/", verifyToken, ctrl.create);
router.delete("/:id", verifyToken, ctrl.remove);

export default router;
