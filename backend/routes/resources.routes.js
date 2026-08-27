import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import * as ctrl from "../controllers/resources.controller.js";

const router = Router();

router.get("/", verifyToken, ctrl.getAll);
router.get("/:id", verifyToken, ctrl.getById);
router.post("/", verifyToken, ctrl.create);
router.put("/:id", verifyToken, requireRole("faculty", "admin"), ctrl.update);
router.delete("/:id", verifyToken, requireRole("faculty", "admin"), ctrl.remove);

// File upload endpoint — mounted here alongside resources since uploads
// create a new resource record.
router.post(
  "/upload",
  verifyToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  ctrl.uploadFile
);

export default router;
