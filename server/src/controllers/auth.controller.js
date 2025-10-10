import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.model.js";
import Cart from "../models/Cart.model.js";
import {
  generateVerificationCode,
  generateCodeExpiry,
  isCodeExpired,
} from "../utils/codeGenerator.js";
import { sendForgotPasswordEmail } from "../utils/emailService.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, full_name } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      full_name,
      role: "user", // Default role is user
    });

    // Create cart for user
    await Cart.create({
      user_id: user._id,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check if user exists and select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { full_name, phone, address, email } = req.body;

    // Prepare update object
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { current_password, new_password } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isPasswordMatch = await user.comparePassword(current_password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = new_password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - Send verification code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate 6-digit code
    const code = generateVerificationCode();
    const codeExpiry = generateCodeExpiry();

    // Save code to user
    user.forgot_password_code = code;
    user.forgot_code_expire = codeExpiry;
    await user.save();

    // Send email
    try {
      await sendForgotPasswordEmail(user, code);

      res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
        data: {
          email: user.email,
          expiresIn: "5 minutes",
        },
      });
    } catch (emailError) {
      // Clear code if email fails
      user.forgot_password_code = undefined;
      user.forgot_code_expire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify forgot password code
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyResetCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, code } = req.body;

    // Find user with code
    const user = await User.findOne({ email }).select(
      "+forgot_password_code +forgot_code_expire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if code exists
    if (!user.forgot_password_code) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
    }

    // Check if code is expired
    if (isCodeExpired(user.forgot_code_expire)) {
      // Clear expired code
      user.forgot_password_code = undefined;
      user.forgot_code_expire = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Check if code matches
    if (user.forgot_password_code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    res.status(200).json({
      success: true,
      message: "Code verified successfully. You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with verified code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, code, new_password } = req.body;

    // Find user with code
    const user = await User.findOne({ email }).select(
      "+password +forgot_password_code +forgot_code_expire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if code exists
    if (!user.forgot_password_code) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
    }

    // Check if code is expired
    if (isCodeExpired(user.forgot_code_expire)) {
      // Clear expired code
      user.forgot_password_code = undefined;
      user.forgot_code_expire = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Check if code matches
    if (user.forgot_password_code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Update password
    user.password = new_password;
    user.forgot_password_code = undefined;
    user.forgot_code_expire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
