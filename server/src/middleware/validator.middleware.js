import { body } from "express-validator";

// ========== AUTH VALIDATIONS ==========

// Validation rules for user registration
export const registerValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters long"),
];

// Validation rules for user login
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for profile update
export const updateProfileValidation = [
  body("full_name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters long"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9]{10,11}$/)
    .withMessage("Phone number must be 10-11 digits"),

  body("address").optional().trim(),
];

// ========== FORGOT PASSWORD VALIDATIONS ==========

// Validation for forgot password request
export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

// Validation for verify reset code
export const verifyResetCodeValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must contain only numbers"),
];

// Validation for reset password
export const resetPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must contain only numbers"),

  body("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),

  body("confirm_password")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// ========== USER MANAGEMENT VALIDATIONS ==========

// Validation rules for user update (admin)
export const updateUserValidation = [
  body("full_name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters long"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9]{10,11}$/)
    .withMessage("Phone number must be 10-11 digits"),

  body("address").optional().trim(),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

// Validation for change password
export const changePasswordValidation = [
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),

  body("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),

  body("confirm_password")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// ========== CATEGORY VALIDATIONS ==========

// Validation rules for creating category
export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters long"),

  body("description").optional().trim(),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid image URL"),
];

// Validation rules for updating category
export const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters long"),

  body("description").optional().trim(),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid image URL"),
];

// ========== PRODUCT VALIDATIONS ==========

// Validation rules for creating product
export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2 })
    .withMessage("Product name must be at least 2 characters long"),

  body("description").optional().trim(),

  body("category_id")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("thumbnail_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid thumbnail URL"),

  body("specifications")
    .optional()
    .isObject()
    .withMessage("Specifications must be an object"),
];

// Validation rules for updating product
export const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty")
    .isLength({ min: 2 })
    .withMessage("Product name must be at least 2 characters long"),

  body("description").optional().trim(),

  body("category_id").optional().isMongoId().withMessage("Invalid category ID"),

  body("thumbnail_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid thumbnail URL"),

  body("specifications")
    .optional()
    .isObject()
    .withMessage("Specifications must be an object"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

// ========== PRODUCT VARIANT VALIDATIONS ==========

// Validation rules for creating variant
export const createVariantValidation = [
  body("color").optional().trim(),

  body("storage").optional().trim(),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price cannot be negative"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("sku").optional().trim(),

  body("additional_specs")
    .optional()
    .isObject()
    .withMessage("Additional specs must be an object"),

  body("image_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid image URL"),
];

// Validation rules for updating variant
export const updateVariantValidation = [
  body("color").optional().trim(),

  body("storage").optional().trim(),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price cannot be negative"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("sku").optional().trim(),

  body("additional_specs")
    .optional()
    .isObject()
    .withMessage("Additional specs must be an object"),

  body("image_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid image URL"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];
