import dotenv from "dotenv";
import connectDB from "../config/database.js";
import { Category } from "../models/index.js";

// Load env vars
dotenv.config();

// Categories data
const categories = [
  {
    name: "iPhone",
    description:
      "Premium smartphones featuring powerful A-series chips, advanced camera systems, and seamless iOS ecosystem integration",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500",
  },
  {
    name: "iPad",
    description:
      "Versatile tablets with Apple Pencil and Magic Keyboard support, perfect for creativity, productivity, and entertainment",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
  },
  {
    name: "Mac",
    description:
      "Desktop and laptop computers powered by Apple Silicon (M1, M2, M3), delivering exceptional performance for professionals",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
  },
  {
    name: "Apple Watch",
    description:
      "Advanced smartwatches with health and fitness tracking features including ECG, blood oxygen monitoring, and activity rings",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
  },
  {
    name: "AirPods",
    description:
      "Premium wireless earbuds with H1/H2 chip, Active Noise Cancellation, Spatial Audio, and seamless device switching",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500",
  },
  {
    name: "Accessories",
    description:
      "Genuine Apple accessories including chargers, cables, cases, keyboards, mice, adapters, and more to enhance your devices",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
  },
];

// Seed categories
const seedCategories = async () => {
  try {
    // Connect to DB
    await connectDB();

    console.log("\n🌱 Starting seed process...\n");

    // Delete existing categories
    const deleteResult = await Category.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing categories`);

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(
      `✅ Successfully seeded ${createdCategories.length} categories:\n`
    );

    // Display created categories
    createdCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
    });

    console.log("\n🎉 Seed completed successfully!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding categories:", error.message);
    process.exit(1);
  }
};

// Run seed
seedCategories();
