import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import swaggerSpec from "./config/swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "MacZone API Documentation",
  })
);

// Swagger JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MacZone E-Commerce API",
    status: "Server is running",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
    version: "1.0.0",
  });
});

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import productVariantRoutes from "./routes/productVariant.routes.js";
import variantRoutes from "./routes/variant.routes.js";
import productImageRoutes from "./routes/productImage.routes.js";
import imageRoutes from "./routes/image.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products/:productId/variants", productVariantRoutes);
app.use("/api/products/:productId/images", productImageRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
