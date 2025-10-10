import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  verifyResetCodeValidation,
  resetPasswordValidation,
} from "../middleware/validator.middleware.js";

const router = express.Router();

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               full_name:
 *                 type: string
 *                 minLength: 2
 *                 example: Nguyễn Văn A
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/register", registerValidation, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidation, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset code
 *     description: Send a 6-digit verification code to user's email (valid for 5 minutes)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       404:
 *         description: No account found with this email
 */
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     description: Verify the 6-digit code sent to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code verified successfully
 *       400:
 *         description: Invalid or expired code
 */
router.post("/verify-reset-code", verifyResetCodeValidation, verifyResetCode);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with verified code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - new_password
 *               - confirm_password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid code or passwords don't match
 */
router.post("/reset-password", resetPasswordValidation, resetPassword);

// ========== PROTECTED ROUTES ==========

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update user profile information
 *     description: Update profile fields (full_name, email, phone, address). Use /change-password endpoint to change password.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Nguyễn Văn B
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *               phone:
 *                 type: string
 *                 pattern: '^\d{10,11}$'
 *                 example: "0123456789"
 *               address:
 *                 type: string
 *                 example: 123 ABC Street
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidation, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change password with current password verification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *               - confirm_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: oldpassword123
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect or unauthorized
 */
router.post(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword
);

export default router;
