import dotenv from "dotenv";
import connectDB from "../config/database.js";
import {
  Category,
  Product,
  ProductVariant,
  ProductImage,
} from "../models/index.js";

// Load env vars
dotenv.config();

const seedProducts = async () => {
  try {
    // Connect to DB
    await connectDB();

    console.log("\n🌱 Starting product seed process...\n");

    // Get categories
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Delete existing products, variants, and images
    await ProductImage.deleteMany({});
    await ProductVariant.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Cleared existing products, variants, and images\n");

    // ==================== IPHONE PRODUCTS ====================
    const iPhoneProducts = [
      {
        name: "iPhone 15 Pro Max",
        description:
          "The ultimate iPhone with titanium design, A17 Pro chip, and the most advanced camera system ever on iPhone",
        category_id: categoryMap["iPhone"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          "https://images.unsplash.com/photo-1695653422715-991ec3a0db7a?w=800",
          "https://images.unsplash.com/photo-1696446702061-cbd8e4932b8e?w=800",
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
          "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800",
        ],
        specifications: {
          Chip: "A17 Pro",
          Display: "6.7-inch Super Retina XDR",
          RAM: "8GB",
          "Refresh Rate": "120Hz ProMotion",
          Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto (5x)",
          "Front Camera": "12MP TrueDepth",
          Battery: "Up to 29 hours video playback",
          Connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3",
          Material: "Titanium",
          "Water Resistance": "IP68",
        },
        variants: [
          {
            color: "Natural Titanium",
            storage: "256GB",
            price: 34990000,
            stock: 15,
          },
          {
            color: "Natural Titanium",
            storage: "512GB",
            price: 40990000,
            stock: 10,
          },
          {
            color: "Natural Titanium",
            storage: "1TB",
            price: 46990000,
            stock: 5,
          },
          {
            color: "Blue Titanium",
            storage: "256GB",
            price: 34990000,
            stock: 12,
          },
          {
            color: "Blue Titanium",
            storage: "512GB",
            price: 40990000,
            stock: 8,
          },
          { color: "Blue Titanium", storage: "1TB", price: 46990000, stock: 4 },
          {
            color: "White Titanium",
            storage: "256GB",
            price: 34990000,
            stock: 18,
          },
          {
            color: "White Titanium",
            storage: "512GB",
            price: 40990000,
            stock: 12,
          },
          {
            color: "Black Titanium",
            storage: "256GB",
            price: 34990000,
            stock: 20,
          },
          {
            color: "Black Titanium",
            storage: "512GB",
            price: 40990000,
            stock: 15,
          },
        ],
      },
      {
        name: "iPhone 15 Pro",
        description:
          "Pro camera system, Action button, A17 Pro chip, and titanium design in a compact size",
        category_id: categoryMap["iPhone"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1696446702061-cbd8e4932b8e?w=800",
        images: [
          "https://images.unsplash.com/photo-1696446702061-cbd8e4932b8e?w=800",
          "https://images.unsplash.com/photo-1678911820864-e5c043c87a98?w=800",
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800",
        ],
        specifications: {
          Chip: "A17 Pro",
          Display: "6.1-inch Super Retina XDR",
          RAM: "8GB",
          "Refresh Rate": "120Hz ProMotion",
          Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto (3x)",
          "Front Camera": "12MP TrueDepth",
          Battery: "Up to 23 hours video playback",
          Connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3",
          Material: "Titanium",
        },
        variants: [
          {
            color: "Natural Titanium",
            storage: "128GB",
            price: 28990000,
            stock: 20,
          },
          {
            color: "Natural Titanium",
            storage: "256GB",
            price: 32990000,
            stock: 15,
          },
          {
            color: "Natural Titanium",
            storage: "512GB",
            price: 38990000,
            stock: 10,
          },
          {
            color: "Blue Titanium",
            storage: "128GB",
            price: 28990000,
            stock: 18,
          },
          {
            color: "Blue Titanium",
            storage: "256GB",
            price: 32990000,
            stock: 12,
          },
          {
            color: "White Titanium",
            storage: "128GB",
            price: 28990000,
            stock: 22,
          },
          {
            color: "Black Titanium",
            storage: "128GB",
            price: 28990000,
            stock: 25,
          },
        ],
      },
      {
        name: "iPhone 15",
        description:
          "Dynamic Island, 48MP Main camera, and A16 Bionic chip in a durable color-infused glass design",
        category_id: categoryMap["iPhone"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1678911820864-e5c043c87a98?w=800",
        specifications: {
          Chip: "A16 Bionic",
          Display: "6.1-inch Super Retina XDR",
          RAM: "6GB",
          "Refresh Rate": "60Hz",
          Camera: "48MP Main + 12MP Ultra Wide",
          Battery: "Up to 20 hours video playback",
          Connectivity: "5G, Wi-Fi 6, Bluetooth 5.3",
        },
        variants: [
          { color: "Pink", storage: "128GB", price: 22990000, stock: 30 },
          { color: "Pink", storage: "256GB", price: 25990000, stock: 20 },
          { color: "Yellow", storage: "128GB", price: 22990000, stock: 25 },
          { color: "Green", storage: "128GB", price: 22990000, stock: 28 },
          { color: "Blue", storage: "128GB", price: 22990000, stock: 35 },
          { color: "Black", storage: "128GB", price: 22990000, stock: 40 },
          { color: "Black", storage: "256GB", price: 25990000, stock: 30 },
        ],
      },
      {
        name: "iPhone 14",
        description:
          "Advanced dual-camera system, Crash Detection, and all-day battery life",
        category_id: categoryMap["iPhone"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800",
        specifications: {
          Chip: "A15 Bionic",
          Display: "6.1-inch Super Retina XDR",
          RAM: "6GB",
          Camera: "12MP Main + 12MP Ultra Wide",
          Battery: "Up to 20 hours video playback",
        },
        variants: [
          { color: "Midnight", storage: "128GB", price: 19990000, stock: 50 },
          { color: "Starlight", storage: "128GB", price: 19990000, stock: 45 },
          { color: "Purple", storage: "128GB", price: 19990000, stock: 40 },
          { color: "Blue", storage: "128GB", price: 19990000, stock: 35 },
        ],
      },
    ];

    // ==================== IPAD PRODUCTS ====================
    const iPadProducts = [
      {
        name: "iPad Pro 12.9-inch (M2)",
        description:
          "The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and Apple Pencil hover",
        category_id: categoryMap["iPad"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1585790050230-5dd28404f905?w=800",
        images: [
          "https://images.unsplash.com/photo-1585790050230-5dd28404f905?w=800",
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800",
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
          "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800",
        ],
        specifications: {
          Chip: "M2",
          Display: "12.9-inch Liquid Retina XDR",
          RAM: "8GB / 16GB",
          "Refresh Rate": "120Hz ProMotion",
          Camera: "12MP Wide + 10MP Ultra Wide",
          "Front Camera": "12MP Ultra Wide with Center Stage",
          Battery: "Up to 10 hours",
          Connectivity: "Wi-Fi 6E, 5G (Cellular models)",
          "Apple Pencil": "2nd generation with hover",
        },
        variants: [
          { color: "Space Gray", storage: "128GB", price: 31990000, stock: 15 },
          { color: "Space Gray", storage: "256GB", price: 35990000, stock: 12 },
          { color: "Space Gray", storage: "512GB", price: 43990000, stock: 8 },
          { color: "Silver", storage: "128GB", price: 31990000, stock: 18 },
          { color: "Silver", storage: "256GB", price: 35990000, stock: 15 },
        ],
      },
      {
        name: "iPad Air (M1)",
        description:
          "Powerful M1 chip, 10.9-inch Liquid Retina display, and support for Magic Keyboard",
        category_id: categoryMap["iPad"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800",
        specifications: {
          Chip: "M1",
          Display: "10.9-inch Liquid Retina",
          RAM: "8GB",
          Camera: "12MP Wide",
          "Front Camera": "12MP Ultra Wide with Center Stage",
          Battery: "Up to 10 hours",
          "Apple Pencil": "2nd generation",
        },
        variants: [
          { color: "Space Gray", storage: "64GB", price: 14990000, stock: 25 },
          { color: "Space Gray", storage: "256GB", price: 18990000, stock: 20 },
          { color: "Starlight", storage: "64GB", price: 14990000, stock: 22 },
          { color: "Purple", storage: "64GB", price: 14990000, stock: 20 },
          { color: "Blue", storage: "64GB", price: 14990000, stock: 18 },
        ],
      },
      {
        name: "iPad 10th Generation",
        description:
          "Colorfully reimagined iPad with A14 Bionic chip and 10.9-inch display",
        category_id: categoryMap["iPad"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
        specifications: {
          Chip: "A14 Bionic",
          Display: "10.9-inch Liquid Retina",
          RAM: "4GB",
          Camera: "12MP Wide",
          Battery: "Up to 10 hours",
          "Apple Pencil": "1st generation",
        },
        variants: [
          { color: "Silver", storage: "64GB", price: 10990000, stock: 30 },
          { color: "Silver", storage: "256GB", price: 13990000, stock: 25 },
          { color: "Blue", storage: "64GB", price: 10990000, stock: 28 },
          { color: "Pink", storage: "64GB", price: 10990000, stock: 26 },
          { color: "Yellow", storage: "64GB", price: 10990000, stock: 24 },
        ],
      },
    ];

    // ==================== MAC PRODUCTS ====================
    const macProducts = [
      {
        name: "MacBook Pro 16-inch (M3 Max)",
        description:
          "The most powerful MacBook Pro ever with M3 Max chip, up to 128GB unified memory, and Liquid Retina XDR display",
        category_id: categoryMap["Mac"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
          "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
        ],
        specifications: {
          Chip: "M3 Max",
          CPU: "16-core",
          GPU: "40-core",
          Display: "16.2-inch Liquid Retina XDR",
          "Max RAM": "128GB Unified Memory",
          "Max Storage": "8TB SSD",
          Battery: "Up to 22 hours",
          Ports: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
        },
        variants: [
          { color: "Space Black", storage: "512GB", price: 89990000, stock: 8 },
          { color: "Space Black", storage: "1TB", price: 99990000, stock: 5 },
          { color: "Silver", storage: "512GB", price: 89990000, stock: 10 },
        ],
      },
      {
        name: "MacBook Pro 14-inch (M3 Pro)",
        description:
          "Supercharged by M3 Pro chip with exceptional performance in a compact design",
        category_id: categoryMap["Mac"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
        specifications: {
          Chip: "M3 Pro",
          CPU: "12-core",
          GPU: "18-core",
          Display: "14.2-inch Liquid Retina XDR",
          RAM: "18GB Unified Memory",
          Battery: "Up to 18 hours",
        },
        variants: [
          {
            color: "Space Black",
            storage: "512GB",
            price: 54990000,
            stock: 12,
          },
          { color: "Space Black", storage: "1TB", price: 64990000, stock: 8 },
          { color: "Silver", storage: "512GB", price: 54990000, stock: 15 },
        ],
      },
      {
        name: "MacBook Air 15-inch (M2)",
        description:
          "Strikingly thin and fast with M2 chip and spacious 15.3-inch display",
        category_id: categoryMap["Mac"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
        specifications: {
          Chip: "M2",
          CPU: "8-core",
          GPU: "10-core",
          Display: "15.3-inch Liquid Retina",
          RAM: "8GB Unified Memory",
          Battery: "Up to 18 hours",
        },
        variants: [
          { color: "Midnight", storage: "256GB", price: 34990000, stock: 20 },
          { color: "Midnight", storage: "512GB", price: 41990000, stock: 15 },
          { color: "Starlight", storage: "256GB", price: 34990000, stock: 18 },
          { color: "Space Gray", storage: "256GB", price: 34990000, stock: 22 },
          { color: "Silver", storage: "256GB", price: 34990000, stock: 25 },
        ],
      },
      {
        name: "MacBook Air 13-inch (M2)",
        description:
          "Remarkably thin and light with M2 chip in four beautiful colors",
        category_id: categoryMap["Mac"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
        specifications: {
          Chip: "M2",
          CPU: "8-core",
          GPU: "8-core / 10-core",
          Display: "13.6-inch Liquid Retina",
          RAM: "8GB Unified Memory",
          Battery: "Up to 18 hours",
        },
        variants: [
          { color: "Midnight", storage: "256GB", price: 28990000, stock: 30 },
          { color: "Midnight", storage: "512GB", price: 35990000, stock: 20 },
          { color: "Starlight", storage: "256GB", price: 28990000, stock: 25 },
          { color: "Space Gray", storage: "256GB", price: 28990000, stock: 28 },
          { color: "Silver", storage: "256GB", price: 28990000, stock: 32 },
        ],
      },
      {
        name: "iMac 24-inch (M3)",
        description:
          "Stunning all-in-one desktop with M3 chip, 4.5K Retina display, and seven vibrant colors",
        category_id: categoryMap["Mac"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
        specifications: {
          Chip: "M3",
          CPU: "8-core",
          GPU: "8-core / 10-core",
          Display: "24-inch 4.5K Retina",
          RAM: "8GB Unified Memory",
          Ports: "2x Thunderbolt, 2x USB-C",
        },
        variants: [
          { color: "Silver", storage: "256GB", price: 32990000, stock: 15 },
          { color: "Blue", storage: "256GB", price: 32990000, stock: 12 },
          { color: "Green", storage: "256GB", price: 32990000, stock: 10 },
          { color: "Pink", storage: "256GB", price: 32990000, stock: 8 },
        ],
      },
    ];

    // ==================== APPLE WATCH PRODUCTS ====================
    const watchProducts = [
      {
        name: "Apple Watch Series 9 (GPS + Cellular)",
        description:
          "Advanced health and fitness features with always-on Retina display and S9 SiP",
        category_id: categoryMap["Apple Watch"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
        specifications: {
          Chip: "S9 SiP",
          Display: "Always-On Retina LTPO OLED",
          "Max Brightness": "2000 nits",
          "Health Features": "ECG, Blood Oxygen, Heart Rate, Temperature",
          "Water Resistance": "50m (WR50)",
          Battery: "Up to 18 hours",
          Connectivity: "GPS + Cellular, Wi-Fi, Bluetooth 5.3",
        },
        variants: [
          {
            color: "Midnight Aluminum",
            storage: "45mm",
            price: 12990000,
            stock: 20,
          },
          {
            color: "Midnight Aluminum",
            storage: "41mm",
            price: 11990000,
            stock: 25,
          },
          {
            color: "Starlight Aluminum",
            storage: "45mm",
            price: 12990000,
            stock: 18,
          },
          {
            color: "Starlight Aluminum",
            storage: "41mm",
            price: 11990000,
            stock: 22,
          },
          {
            color: "Silver Aluminum",
            storage: "45mm",
            price: 12990000,
            stock: 15,
          },
        ],
      },
      {
        name: "Apple Watch Ultra 2",
        description:
          "The most rugged and capable Apple Watch with titanium case, Action button, and precision dual-frequency GPS",
        category_id: categoryMap["Apple Watch"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800",
        specifications: {
          Chip: "S9 SiP",
          Display: "Always-On Retina LTPO OLED",
          "Max Brightness": "3000 nits",
          Case: "Titanium",
          "Water Resistance": "100m (WR100)",
          Battery: "Up to 36 hours",
          GPS: "Precision dual-frequency",
        },
        variants: [
          {
            color: "Natural Titanium",
            storage: "49mm",
            price: 21990000,
            stock: 12,
          },
        ],
      },
      {
        name: "Apple Watch SE (2nd gen)",
        description:
          "Essential features at an affordable price with Retina display and advanced sensors",
        category_id: categoryMap["Apple Watch"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800",
        specifications: {
          Chip: "S8 SiP",
          Display: "Retina LTPO OLED",
          "Health Features": "Heart Rate, Crash Detection, Fall Detection",
          "Water Resistance": "50m",
          Battery: "Up to 18 hours",
        },
        variants: [
          {
            color: "Midnight Aluminum",
            storage: "44mm",
            price: 6990000,
            stock: 35,
          },
          {
            color: "Midnight Aluminum",
            storage: "40mm",
            price: 6490000,
            stock: 40,
          },
          {
            color: "Starlight Aluminum",
            storage: "44mm",
            price: 6990000,
            stock: 30,
          },
          {
            color: "Silver Aluminum",
            storage: "44mm",
            price: 6990000,
            stock: 32,
          },
        ],
      },
    ];

    // ==================== AIRPODS PRODUCTS ====================
    const airPodsProducts = [
      {
        name: "AirPods Pro (2nd generation)",
        description:
          "Active Noise Cancellation, Adaptive Audio, and personalized Spatial Audio with H2 chip",
        category_id: categoryMap["AirPods"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
        images: [
          "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
          "https://images.unsplash.com/photo-1588156979435-379b2c84c6bd?w=800",
          "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800",
        ],
        specifications: {
          Chip: "H2",
          "Noise Cancellation": "Active Noise Cancellation",
          "Audio Features": "Adaptive Audio, Transparency Mode, Spatial Audio",
          "Battery Life": "6 hours (ANC on), 30 hours with case",
          Charging: "USB-C, MagSafe, Qi wireless",
          "Water Resistance": "IP54",
          Controls: "Touch control, Swipe volume",
        },
        variants: [
          { color: "White", storage: "USB-C", price: 6490000, stock: 50 },
        ],
      },
      {
        name: "AirPods Max",
        description:
          "Over-ear headphones with Active Noise Cancellation, Spatial Audio, and exceptional sound quality",
        category_id: categoryMap["AirPods"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1625758525758-ee5f0e1ba3be?w=800",
        specifications: {
          Chip: "H1",
          "Noise Cancellation": "Active Noise Cancellation",
          "Audio Features": "Spatial Audio, Transparency Mode",
          "Battery Life": "20 hours (ANC on)",
          Materials: "Aluminum cups, Knit mesh canopy",
          Controls: "Digital Crown, Noise control button",
        },
        variants: [
          { color: "Silver", storage: "", price: 13990000, stock: 15 },
          { color: "Space Gray", storage: "", price: 13990000, stock: 12 },
          { color: "Sky Blue", storage: "", price: 13990000, stock: 10 },
          { color: "Pink", storage: "", price: 13990000, stock: 8 },
          { color: "Green", storage: "", price: 13990000, stock: 6 },
        ],
      },
      {
        name: "AirPods (3rd generation)",
        description:
          "Spatial Audio, Adaptive EQ, and sweat-resistant design with up to 30 hours of battery",
        category_id: categoryMap["AirPods"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800",
        specifications: {
          Chip: "H1",
          "Audio Features": "Spatial Audio, Adaptive EQ",
          "Battery Life": "6 hours, 30 hours with case",
          Charging: "Lightning, MagSafe, Qi wireless",
          "Water Resistance": "IPX4",
        },
        variants: [
          { color: "White", storage: "Lightning", price: 4490000, stock: 60 },
        ],
      },
      {
        name: "AirPods (2nd generation)",
        description:
          "Effortless setup, high-quality sound, and seamless switching between devices",
        category_id: categoryMap["AirPods"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1588156979435-379b2c84c6bd?w=800",
        specifications: {
          Chip: "H1",
          "Battery Life": "5 hours, 24 hours with case",
          Charging: "Lightning",
          Controls: "Double-tap",
        },
        variants: [{ color: "White", storage: "", price: 3290000, stock: 80 }],
      },
    ];

    // ==================== ACCESSORIES PRODUCTS ====================
    const accessoriesProducts = [
      {
        name: "Magic Keyboard with Touch ID (USB-C)",
        description:
          "Wireless keyboard with Touch ID and numeric keypad for secure authentication",
        category_id: categoryMap["Accessories"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        specifications: {
          Connectivity: "Bluetooth",
          "Touch ID": "Yes",
          "Numeric Keypad": "Yes",
          Compatibility: "Mac with Apple silicon",
          Battery: "Rechargeable via USB-C",
        },
        variants: [
          { color: "Silver/White", storage: "", price: 4990000, stock: 30 },
          { color: "Space Gray/Black", storage: "", price: 4990000, stock: 25 },
        ],
      },
      {
        name: "Magic Mouse (USB-C)",
        description: "Wireless, rechargeable mouse with Multi-Touch surface",
        category_id: categoryMap["Accessories"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
        specifications: {
          Connectivity: "Bluetooth",
          "Multi-Touch": "Yes",
          Charging: "USB-C",
          Battery: "Up to 1 month per charge",
        },
        variants: [
          { color: "White", storage: "", price: 2190000, stock: 40 },
          { color: "Black", storage: "", price: 2190000, stock: 35 },
        ],
      },
      {
        name: "Apple Pencil (2nd generation)",
        description:
          "Pixel-perfect precision and industry-leading low latency for iPad Pro and iPad Air",
        category_id: categoryMap["Accessories"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800",
        specifications: {
          Attachment: "Magnetic",
          Charging: "Wireless (via iPad)",
          "Pressure Sensitivity": "Yes",
          "Tilt Sensitivity": "Yes",
          Compatibility: "iPad Pro, iPad Air (4th gen and later)",
        },
        variants: [{ color: "White", storage: "", price: 3290000, stock: 45 }],
      },
      {
        name: "20W USB-C Power Adapter",
        description:
          "Fast, efficient charging at home, in the office, or on the go",
        category_id: categoryMap["Accessories"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1609592306580-1134723f2d3d?w=800",
        specifications: {
          Type: "USB-C Power Adapter",
          Power: "20W",
          "Input Voltage": "100-240V AC",
          Output: "9V/2.22A or 5V/3A",
          Compatibility: "iPhone, iPad, AirPods",
        },
        variants: [{ color: "White", storage: "", price: 490000, stock: 100 }],
      },
      {
        name: "USB-C to Lightning Cable (1m)",
        description:
          "Connect your iPhone or other device with Lightning connector to charge and sync",
        category_id: categoryMap["Accessories"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1591290619762-d36b70114e0d?w=800",
        specifications: {
          Length: "1 meter",
          Connectors: "USB-C to Lightning",
          "Fast Charging": "Yes (with compatible adapter)",
          Compatibility: "iPhone, iPad, AirPods",
        },
        variants: [{ color: "White", storage: "", price: 490000, stock: 120 }],
      },
      {
        name: "MagSafe Charger",
        description:
          "Perfectly aligned magnets attach to your iPhone 12 and later for faster wireless charging",
        category_id: categoryMap["Accessories"],
        thumbnail_url:
          "https://images.unsplash.com/photo-1625297139332-c582b7c78f20?w=800",
        specifications: {
          Type: "Magnetic Wireless Charger",
          "Max Power": "15W",
          "Cable Length": "1 meter",
          Compatibility:
            "iPhone 12 and later, AirPods with wireless charging case",
        },
        variants: [{ color: "White", storage: "", price: 990000, stock: 70 }],
      },
    ];

    // Combine all products
    const allProducts = [
      ...iPhoneProducts,
      ...iPadProducts,
      ...macProducts,
      ...watchProducts,
      ...airPodsProducts,
      ...accessoriesProducts,
    ];

    // Create products, variants, and images
    let productsCreated = 0;
    let variantsCreated = 0;
    let imagesCreated = 0;

    for (const productData of allProducts) {
      const { variants, images, ...productInfo } = productData;

      // Create product
      const product = await Product.create(productInfo);
      productsCreated++;

      // Create product images (nếu có)
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await ProductImage.create({
            product_id: product._id,
            image_url: images[i],
            display_order: i + 1,
          });
          imagesCreated++;
        }
      }

      // Create variants for this product
      for (const variantData of variants) {
        await ProductVariant.create({
          product_id: product._id,
          ...variantData,
          sku: `${product.name.substring(0, 3).toUpperCase()}-${
            variantData.storage || variantData.color
          }-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        });
        variantsCreated++;
      }

      console.log(
        `✅ Created: ${product.name} (${variants.length} variants, ${
          images?.length || 0
        } images)`
      );
    }

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`   Products created: ${productsCreated}`);
    console.log(`   Variants created: ${variantsCreated}`);
    console.log(`   Images created: ${imagesCreated}\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding products:", error);
    process.exit(1);
  }
};

// Run seed
seedProducts();
