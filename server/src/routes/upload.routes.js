import express from "express";
import { upload } from "../utils/uploadService.js";
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} from "../controllers/upload.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize("admin"));

// Upload single image
router.post("/image", upload.single("image"), uploadImage);

// Upload multiple images
router.post("/images", upload.array("images", 10), uploadMultipleImages);

// Delete image
router.delete("/image", deleteImage);

export default router;
