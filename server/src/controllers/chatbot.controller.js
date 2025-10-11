import { validationResult } from "express-validator";
import {
  Category,
  Product,
  ProductVariant,
  AIMessage,
  RecommendedProduct,
} from "../models/index.js";
import {
  analyzeAndRecommendProducts,
  generateGreetingMessage,
  generatePriceRangeMessage,
  generateStoryRequestMessage,
} from "../utils/geminiService.js";

// Price ranges configuration
const PRICE_RANGES = [
  { min: 0, max: 10000000, label: "Dưới 10 triệu" },
  { min: 10000000, max: 20000000, label: "10 - 20 triệu" },
  { min: 20000000, max: 30000000, label: "20 - 30 triệu" },
  { min: 30000000, max: 50000000, label: "30 - 50 triệu" },
  { min: 50000000, max: null, label: "Trên 50 triệu" },
];

// @desc    Start chatbot conversation - Get greeting and categories
// @route   POST /api/chatbot/start
// @access  Private
export const startChat = async (req, res, next) => {
  try {
    // Get all active categories
    const categories = await Category.find({});

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    // Generate greeting message
    const greetingMessage = generateGreetingMessage(categories);

    res.status(200).json({
      success: true,
      message: "Chat started successfully",
      data: {
        greeting: greetingMessage,
        categories: categories.map((cat) => ({
          id: cat._id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price ranges
// @route   GET /api/chatbot/price-ranges
// @access  Private
export const getPriceRanges = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Generate price range message
    const priceRangeMessage = generatePriceRangeMessage(
      category.name,
      PRICE_RANGES
    );

    res.status(200).json({
      success: true,
      data: {
        message: priceRangeMessage,
        priceRanges: PRICE_RANGES.map((range, index) => ({
          id: index,
          min: range.min,
          max: range.max,
          label: range.label,
        })),
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid category ID",
      });
    }
    next(error);
  }
};

// @desc    Get story request message
// @route   POST /api/chatbot/story-request
// @access  Private
export const getStoryRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { categoryId, priceRangeId } = req.body;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get price range
    const priceRange = PRICE_RANGES[priceRangeId];
    if (!priceRange) {
      return res.status(400).json({
        success: false,
        message: "Invalid price range ID",
      });
    }

    // Generate story request message
    const storyRequestMessage = generateStoryRequestMessage(
      category.name,
      priceRange.min,
      priceRange.max
    );

    res.status(200).json({
      success: true,
      data: {
        message: storyRequestMessage,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid category ID",
      });
    }
    next(error);
  }
};

// @desc    Get product recommendations based on user story
// @route   POST /api/chatbot/recommend
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { categoryId, priceRangeId, userStory } = req.body;

    // Validate inputs
    if (!userStory || userStory.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "User story must be at least 10 characters",
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get price range
    const priceRange = PRICE_RANGES[priceRangeId];
    if (!priceRange) {
      return res.status(400).json({
        success: false,
        message: "Invalid price range ID",
      });
    }

    // Build query to get products with variants in price range
    const products = await Product.find({
      category_id: categoryId,
      is_active: true,
    }).populate("category_id", "name description");

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this category",
      });
    }

    // Get variants for each product and filter by price range
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({
          product_id: product._id,
          is_active: true,
          stock: { $gt: 0 },
        }).sort("price");

        // Filter variants by price range
        const filteredVariants = variants.filter((variant) => {
          if (priceRange.max) {
            return (
              variant.price >= priceRange.min && variant.price <= priceRange.max
            );
          } else {
            return variant.price >= priceRange.min;
          }
        });

        if (filteredVariants.length > 0) {
          // Get the cheapest variant in range
          const cheapestVariant = filteredVariants[0];
          return {
            ...product.toObject(),
            price: cheapestVariant.price,
            variantId: cheapestVariant._id,
            storage: cheapestVariant.storage,
            color: cheapestVariant.color,
          };
        }
        return null;
      })
    );

    // Filter out null values (products without variants in price range)
    const filteredProducts = productsWithVariants.filter(
      (product) => product !== null
    );

    // If no products found
    if (filteredProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No products found in the selected price range. Please try a different price range.",
      });
    }

    // Use Gemini AI to analyze and recommend top 3 products
    const aiResult = await analyzeAndRecommendProducts(
      userStory,
      filteredProducts
    );

    // Save AI message to database
    const aiMessage = await AIMessage.create({
      user_id: userId,
      category_id: categoryId,
      price_range_min: priceRange.min,
      price_range_max: priceRange.max,
      user_description: userStory,
      gemini_token_used: aiResult.tokenUsed || 0,
    });

    // Save recommended products
    const recommendedProducts = await Promise.all(
      aiResult.recommendations.map(async (rec) => {
        const product = filteredProducts.find(
          (p) => p._id.toString() === rec.productId
        );

        if (!product) {
          console.warn(
            `Product with ID ${rec.productId} not found in filtered products`
          );
          return null;
        }

        return await RecommendedProduct.create({
          ai_message_id: aiMessage._id,
          product_id: rec.productId,
          variant_id: product.variantId,
          price: product.price,
          storage: product.storage,
          color: product.color,
          rank: rec.rank,
          reason: rec.reason,
        });
      })
    );

    // Filter out null values
    const validRecommendedProducts = recommendedProducts.filter(
      (rp) => rp !== null
    );

    // Populate product details for response
    const recommendations = await Promise.all(
      validRecommendedProducts.map(async (rec) => {
        const product = await Product.findById(rec.product_id)
          .populate("category_id", "name description")
          .lean();

        const productWithVariant = filteredProducts.find(
          (p) => p._id.toString() === rec.product_id.toString()
        );

        return {
          rank: rec.rank,
          product: {
            ...product,
            price: productWithVariant?.price,
            variantId: productWithVariant?.variantId,
            storage: productWithVariant?.storage,
            color: productWithVariant?.color,
          },
          reason: rec.reason,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Recommendations generated successfully",
      data: {
        aiMessageId: aiMessage._id,
        categoryName: category.name,
        priceRange: {
          min: priceRange.min,
          max: priceRange.max,
          label: priceRange.label,
        },
        userStory,
        recommendations: recommendations.sort((a, b) => a.rank - b.rank),
        tokensUsed: aiResult.tokenUsed,
      },
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid ID provided",
      });
    }
    next(error);
  }
};

// @desc    Get user's chat history (AI messages)
// @route   GET /api/chatbot/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get AI messages for user
    const aiMessages = await AIMessage.find({ user_id: userId })
      .populate("category_id", "name description image")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await AIMessage.countDocuments({ user_id: userId });

    // Get recommended products for each AI message
    const history = await Promise.all(
      aiMessages.map(async (aiMsg) => {
        const recommendations = await RecommendedProduct.find({
          ai_message_id: aiMsg._id,
        })
          .populate({
            path: "product_id",
            populate: {
              path: "category_id",
              select: "name",
            },
          })
          .sort("rank");

        return {
          id: aiMsg._id,
          category: aiMsg.category_id,
          priceRange: {
            min: aiMsg.price_range_min,
            max: aiMsg.price_range_max,
          },
          userStory: aiMsg.user_description,
          recommendations: recommendations.map((rec) => ({
            rank: rec.rank,
            product: {
              ...rec.product_id.toObject(),
              price: rec.price,
              storage: rec.storage,
              color: rec.color,
            },
            reason: rec.reason,
          })),
          tokensUsed: aiMsg.gemini_token_used,
          createdAt: aiMsg.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: aiMessages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single AI message detail with recommendations
// @route   GET /api/chatbot/history/:id
// @access  Private
export const getAIMessageDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const aiMessageId = req.params.id;

    // Get AI message
    const aiMessage = await AIMessage.findOne({
      _id: aiMessageId,
      user_id: userId,
    }).populate("category_id", "name description image");

    if (!aiMessage) {
      return res.status(404).json({
        success: false,
        message: "AI message not found",
      });
    }

    // Get recommended products
    const recommendations = await RecommendedProduct.find({
      ai_message_id: aiMessageId,
    })
      .populate({
        path: "product_id",
        populate: {
          path: "category_id",
          select: "name description",
        },
      })
      .sort("rank");

    // Get variants for each recommended product
    const recommendationsWithVariants = await Promise.all(
      recommendations.map(async (rec) => {
        const variants = await ProductVariant.find({
          product_id: rec.product_id._id,
          is_active: true,
        }).sort("price");

        return {
          rank: rec.rank,
          product: {
            ...rec.product_id.toObject(),
            variants,
          },
          reason: rec.reason,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        id: aiMessage._id,
        category: aiMessage.category_id,
        priceRange: {
          min: aiMessage.price_range_min,
          max: aiMessage.price_range_max,
        },
        userStory: aiMessage.user_description,
        recommendations: recommendationsWithVariants,
        tokensUsed: aiMessage.gemini_token_used,
        createdAt: aiMessage.createdAt,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid AI message ID",
      });
    }
    next(error);
  }
};

// Note: ChatRoom is used for chat with support staff, not for AI chatbot
// AI chatbot conversations are tracked through AIMessage and RecommendedProduct models
