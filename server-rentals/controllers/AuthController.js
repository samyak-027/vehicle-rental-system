import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import transporter from "../config/nodemailer.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

/* ================================
   REGISTER
================================ */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashed,
      verifyotp: otp,
      verifyOtpExpireAt: Date.now() + 15 * 60 * 1000,
      isAuth: false,
    });

    // Try to send email, but don't fail registration if email fails
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || 'noreply@ridesurf.com',
        to: email,
        subject: "Verify Your Account",
        text: `Your OTP is ${otp}`,
      });
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      console.log(`OTP for ${email}: ${otp} (Email sending failed, check console)`);
    }

    res.json({
      success: true,
      message: "User registered successfully. Check console for OTP if email fails.",
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only show OTP in development
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================================
   VERIFY EMAIL OTP
================================ */
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (
    !user ||
    user.verifyotp !== otp ||
    user.verifyOtpExpireAt < Date.now()
  ) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }

  user.verifyotp = null;
  user.verifyOtpExpireAt = null;
  user.isAuth = true;
  await user.save();

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false, // true in production
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      licenseStatus: user.licenseStatus,
    },
  });
};

/* ================================
   LOGIN
================================ */
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isAuth)
    return res.status(403).json({ message: "Verify email first" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      licenseStatus: user.licenseStatus,
    },
  });
};

/* ================================
   RESEND OTP
================================ */
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.json({ success: false, message: "User not found" });

    if (user.isAuth)
      return res.json({ success: false, message: "Already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyotp = otp;
    user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Try to send email, but don't fail if email fails
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || 'noreply@ridesurf.com',
        to: user.email,
        subject: "Resend OTP",
        text: `Your new OTP is ${otp}`,
      });
      console.log(`OTP resent to ${user.email}: ${otp}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      console.log(`OTP for ${user.email}: ${otp} (Email sending failed, check console)`);
    }

    res.json({ 
      success: true, 
      message: "OTP resent successfully. Check console if email fails.",
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================================
   REFRESH TOKEN
================================ */
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid token" });

    const newAccessToken = generateAccessToken(user);
    res.json({ token: newAccessToken });
  } catch {
    res.status(403).json({ message: "Token expired" });
  }
};

/* ================================
   LOGOUT
================================ */
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    );
  }

  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
};

/* ================================
   AUTH CHECK
================================ */
export const checkSession = async (req, res) => {
  res.json({ success: true, user: req.user });
};
