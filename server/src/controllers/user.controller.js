import { validationResult } from "express-validator";
import { User, Order, Cart } from "../models/index.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password -forgot_password_code -forgot_code_expire")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const count = await User.countDocuments(query);

    // Get order count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user_id: user._id });
        const totalSpent = await Order.aggregate([
          { $match: { user_id: user._id, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]);

        return {
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          stats: {
            orderCount,
            totalSpent: totalSpent[0]?.total || 0,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -forgot_password_code -forgot_code_expire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user statistics
    const orderCount = await Order.countDocuments({ user_id: user._id });
    const orders = await Order.find({ user_id: user._id })
      .sort("-createdAt")
      .limit(5)
      .select("_id status total_price createdAt");

    const totalSpent = await Order.aggregate([
      { $match: { user_id: user._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total_price" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        stats: {
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
          recentOrders: orders,
        },
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    next(error);
  }
};

// @desc    Update user by ID (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { full_name, email, phone, address } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update object
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -forgot_password_code -forgot_code_expire");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Prevent deleting other admins
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin accounts",
      });
    }

    // Check if user has pending/processing orders
    const pendingOrders = await Order.countDocuments({
      user_id: user._id,
      status: { $in: ["pending", "confirmed", "shipping"] },
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${pendingOrders} active order(s). Please complete or cancel them first.`,
      });
    }

    // Delete user's cart
    await Cart.deleteOne({ user_id: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    next(error);
  }
};

// @desc    Get user statistics (Admin dashboard)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res, next) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Top customers by spending
    const topCustomers = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$user_id",
          totalSpent: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          full_name: "$user.full_name",
          email: "$user.email",
          totalSpent: 1,
          orderCount: 1,
        },
      },
    ]);

    // User growth by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        newUsersThisMonth,
        topCustomers,
        userGrowth,
      },
    });
  } catch (error) {
    next(error);
  }
};
