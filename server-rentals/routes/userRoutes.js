import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
  getUsersForBooking,
  getUserData,
  UpdateProfileCheck,
  uploadLicense,
  verifyLicense,
  rejectLicense,
} from "../controllers/UserController.js";

import { authenticateUser } from "../middleware/authUser.js";
import { authenticateAdmin } from "../middleware/Auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* USER */
router.get("/me", authenticateUser, getUserData);
router.put("/update-profile", authenticateUser, updateUserProfile);
router.post("/verify-profile-update", authenticateUser, UpdateProfileCheck);

router.post(
  "/upload-license",
  authenticateUser,
  upload.fields([
    { name: "licenseFront", maxCount: 1 },
    { name: "licenseBack", maxCount: 1 },
  ]),
  uploadLicense
);

router.delete("/delete", authenticateUser, deleteUser);

/* ADMIN */
router.get("/getAllusers", authenticateAdmin, getAllUsers);
router.get("/for-booking", authenticateAdmin, getUsersForBooking);
router.get("/:id", authenticateAdmin, getUserById);
router.patch("/verify-license/:userId", authenticateAdmin, verifyLicense);
router.patch("/reject-license/:userId", authenticateAdmin, rejectLicense);

export default router;
