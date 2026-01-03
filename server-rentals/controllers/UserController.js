import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js";

/* ============================
   GET LOGGED-IN USER
============================ */
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================
   UPDATE PROFILE (SEND OTP)
============================ */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyotp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

    user.pendingUpdate = {
      name,
      email,
      password,
    };

    await user.save();

    await transporter.sendMail({
      to: user.email,
      subject: "Verify Profile Update",
      text: `Your OTP is ${otp}`,
    });

    res.json({ success: true, message: "OTP sent for profile update" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================
   VERIFY PROFILE OTP
============================ */
export const UpdateProfileCheck = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (
      !user ||
      user.verifyotp !== otp ||
      user.verifyOtpExpireAt < Date.now()
    ) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const pending = user.pendingUpdate;

    if (pending) {
      user.name = pending.name;
      user.email = pending.email;

      if (pending.password) {
        user.password = await bcrypt.hash(pending.password, 10);
      }

      user.pendingUpdate = null;
    }

    user.verifyotp = null;
    user.verifyOtpExpireAt = null;

    await user.save();

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================
   LICENSE UPLOAD
============================ */
export const uploadLicense = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.licenseFront = req.files.licenseFront[0].path;
    user.licenseBack = req.files.licenseBack[0].path;
    user.licenseStatus = "PENDING";

    await user.save();

    res.json({ success: true, message: "License uploaded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================
   ADMIN: VERIFY LICENSE
============================ */
export const verifyLicense = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  user.licenseStatus = "APPROVED";
  await user.save();

  res.json({ success: true, message: "License approved" });
};

/* ============================
   ADMIN: REJECT LICENSE
============================ */
export const rejectLicense = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  user.licenseStatus = "REJECTED";
  user.licenseFront = null;
  user.licenseBack = null;

  await user.save();

  res.json({ success: true, message: "License rejected" });
};

/* ============================
   ADMIN / GENERAL
============================ */
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, users });
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json({ success: true, user });
};

export const getUsersForBooking = async (req, res) => {
  try {
    const users = await User.find({}, "name email");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ success: true, message: "User deleted" });
};
