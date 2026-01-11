// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize Gemini AI (lazy initialization to ensure env is loaded)
// let genAI = null;
// const getGenAI = () => {
//   if (!genAI) {
//     if (!process.env.GEMINI_API_KEY) {
//       throw new Error("GEMINI_API_KEY is not set in environment variables");
//     }
//     genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   }
//   return genAI;
// };

// /**
//  * Analyze user story and recommend top 3 products from the given list
//  * @param {string} userStory - User's description of what they need
//  * @param {Array} products - Array of product objects with details
//  * @returns {Promise<Object>} - Analysis result with top 3 recommendations and reasons
//  */
// export const analyzeAndRecommendProducts = async (userStory, products) => {
//   try {
//     // Get the generative model
//     // Using Gemini 2.0 Flash (Experimental) - latest model, supports all API keys
//     // You can also use: "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"
//     const genAIInstance = getGenAI();
//     const model = genAIInstance.getGenerativeModel({
//       model: process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash",
//     });

//     // Prepare products data for analysis
//     const productsData = products.map((product, index) => ({
//       id: product._id.toString(),
//       index: index + 1,
//       name: product.name,
//       description: product.description,
//       price: product.price || "N/A",
//       specifications: product.specifications
//         ? Object.fromEntries(product.specifications)
//         : {},
//       category: product.category_id?.name || "Unknown",
//     }));

//     // Create prompt for Gemini
//     const prompt = `
// Bạn là một chuyên gia tư vấn sản phẩm công nghệ Apple. Nhiệm vụ của bạn là phân tích nhu cầu của khách hàng và đề xuất 3 sản phẩm phù hợp nhất từ danh sách dưới đây.

// NHU CẦU KHÁCH HÀNG:
// ${userStory}

// DANH SÁCH SẢN PHẨM:
// ${JSON.stringify(productsData, null, 2)}

// YÊU CẦU:
// 1. Phân tích kỹ nhu cầu của khách hàng
// 2. Chọn TỐI ĐA 3 sản phẩm phù hợp nhất (nếu có ít hơn 3 sản phẩm thì chọn tất cả, xếp hạng từ 1-3, 1 là phù hợp nhất)
// 3. Với mỗi sản phẩm, giải thích ngắn gọn (2-3 câu) TẠI SAO sản phẩm này phù hợp với nhu cầu

// ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC PHẢI THEO ĐÚNG JSON):
// {
//   "recommendations": [
//     {
//       "productId": "ID của sản phẩm",
//       "rank": 1,
//       "reason": "Lý do tại sao sản phẩm này phù hợp (2-3 câu, tiếng Việt)"
//     },
//     {
//       "productId": "ID của sản phẩm",
//       "rank": 2,
//       "reason": "Lý do tại sao sản phẩm này phù hợp (2-3 câu, tiếng Việt)"
//     },
//     {
//       "productId": "ID của sản phẩm",
//       "rank": 3,
//       "reason": "Lý do tại sao sản phẩm này phù hợp (2-3 câu, tiếng Việt)"
//     }
//   ]
// }

// CHÚ Ý:
// - Chỉ trả về JSON, không thêm text nào khác
// - productId phải là ID thật từ danh sách sản phẩm
// - Nếu có ít hơn 3 sản phẩm, chỉ cần đề xuất số sản phẩm có sẵn (1-2 sản phẩm cũng được)
// - Lý do phải cụ thể, liên quan đến nhu cầu của khách hàng
// - Viết bằng tiếng Việt tự nhiên, thân thiện
// `;

//     // Generate content
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     // Parse JSON response
//     let parsedResponse;
//     try {
//       // Remove markdown code blocks if present
//       const cleanText = text
//         .replace(/```json\n?/g, "")
//         .replace(/```\n?/g, "")
//         .trim();
//       parsedResponse = JSON.parse(cleanText);
//     } catch (parseError) {
//       console.error("Failed to parse Gemini response:", text);
//       throw new Error("Failed to parse AI response");
//     }

//     // Validate response structure
//     if (
//       !parsedResponse.recommendations ||
//       !Array.isArray(parsedResponse.recommendations)
//     ) {
//       throw new Error("Invalid response structure from AI");
//     }

//     // Get token usage info
//     const tokenCount = response.usageMetadata
//       ? response.usageMetadata.totalTokenCount
//       : 0;

//     return {
//       recommendations: parsedResponse.recommendations,
//       tokenUsed: tokenCount,
//     };
//   } catch (error) {
//     console.error("Gemini API Error:", error.message);
//     throw new Error(`AI analysis failed: ${error.message}`);
//   }
// };

// /**
//  * Generate greeting message with categories
//  * @param {Array} categories - Array of category objects
//  * @returns {string} - Greeting message
//  */
// export const generateGreetingMessage = (categories) => {
//   const categoryList = categories
//     .map((cat, index) => `${index + 1}. ${cat.name}`)
//     .join("\n");

//   return `Xin chào! 👋

// Tôi là trợ lý AI của MacZone, rất vui được hỗ trợ bạn tìm kiếm sản phẩm Apple phù hợp nhất!

// Để giúp bạn tìm được sản phẩm ưng ý, hãy cho tôi biết bạn đang tìm loại sản phẩm nào:

// ${categoryList}

// Bạn muốn tìm loại sản phẩm nào? 😊`;
// };

// /**
//  * Generate price range selection message
//  * @param {Array} priceRanges - Array of price range objects
//  * @returns {string} - Price range message
//  */
// export const generatePriceRangeMessage = (categoryName, priceRanges) => {
//   const rangeList = priceRanges
//     .map((range, index) => {
//       const minFormatted = range.min.toLocaleString("vi-VN");
//       const maxFormatted = range.max
//         ? range.max.toLocaleString("vi-VN")
//         : "Trở lên";
//       return `${index + 1}. ${minFormatted}₫ - ${
//         range.max ? maxFormatted + "₫" : maxFormatted
//       }`;
//     })
//     .join("\n");

//   return `Tuyệt vời! Bạn đã chọn ${categoryName}.

// Để tìm được sản phẩm phù hợp với ngân sách của bạn, hãy cho tôi biết khoảng giá bạn quan tâm:

// ${rangeList}

// Bạn muốn chọn khoảng giá nào? 💰`;
// };

// /**
//  * Generate story request message
//  * @param {string} categoryName - Selected category name
//  * @param {number} priceMin - Min price
//  * @param {number} priceMax - Max price
//  * @returns {string} - Story request message
//  */
// export const generateStoryRequestMessage = (
//   categoryName,
//   priceMin,
//   priceMax
// ) => {
//   const priceRange = priceMax
//     ? `${priceMin.toLocaleString("vi-VN")}₫ - ${priceMax.toLocaleString(
//         "vi-VN"
//       )}₫`
//     : `Từ ${priceMin.toLocaleString("vi-VN")}₫ trở lên`;

//   return `Tuyệt vời! Tôi đã hiểu:
// - Loại sản phẩm: ${categoryName}
// - Khoảng giá: ${priceRange}

// Bây giờ, hãy cho tôi biết thêm về nhu cầu sử dụng của bạn nhé! Ví dụ:
// - Bạn sẽ dùng sản phẩm để làm gì? (làm việc, học tập, giải trí, chơi game...)
// - Bạn có yêu cầu đặc biệt nào không? (màn hình lớn, pin trâu, hiệu năng cao...)
// - Bạn quan tâm đến tính năng nào nhất?

// Hãy mô tả chi tiết để tôi có thể gợi ý chính xác nhất cho bạn! ✨`;
// };

// export default {
//   analyzeAndRecommendProducts,
//   generateGreetingMessage,
//   generatePriceRangeMessage,
//   generateStoryRequestMessage,
// };

// TODO: Tạm thời dùng AI khác, vì Gemini đang chặn free tier
import Groq from "groq-sdk";

// Initialize Groq AI
let groq = null;
const getGroq = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

/**
 * Analyze user story and recommend top 3 products from the given list
 */
export const analyzeAndRecommendProducts = async (userStory, products) => {
  try {
    const groqInstance = getGroq();

    // Prepare products data
    const productsData = products.map((product, index) => ({
      id: product._id.toString(),
      index: index + 1,
      name: product.name,
      description: product.description,
      price: product.price || "N/A",
      specifications: product.specifications
        ? Object.fromEntries(product.specifications)
        : {},
      category: product.category_id?.name || "Unknown",
    }));

    // Prompt
    const prompt = `
      BẠN LÀ HỆ THỐNG AI.

      ⚠️ QUY TẮC BẮT BUỘC:
      - Chỉ trả về JSON hợp lệ
      - KHÔNG markdown
      - KHÔNG lời dẫn
      - KHÔNG giải thích
      - KHÔNG có text trước hoặc sau JSON
      - Nếu vi phạm → trả về JSON rỗng {}

      ====================

      Bạn là một chuyên gia tư vấn sản phẩm công nghệ Apple. 
      Nhiệm vụ của bạn là phân tích nhu cầu của khách hàng và đề xuất 3 sản phẩm phù hợp nhất.

      NHU CẦU KHÁCH HÀNG:
      ${userStory}

      DANH SÁCH SẢN PHẨM:
      ${JSON.stringify(productsData, null, 2)}

      YÊU CẦU:
      - Chọn TỐI ĐA 3 sản phẩm phù hợp nhất
      - Xếp hạng từ 1 đến 3 (1 là phù hợp nhất)
      - Mỗi sản phẩm giải thích 2–3 câu, tiếng Việt

      ĐỊNH DẠNG TRẢ LỜI (JSON BẮT BUỘC):
      {
        "recommendations": [
          {
            "productId": "string",
            "rank": 1,
            "reason": "string"
          }
        ]
      }
      `;

    // Call Groq
    const completion = await groqInstance.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    // Parse JSON
    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsedResponse = JSON.parse(cleanText);

    if (
      !parsedResponse.recommendations ||
      !Array.isArray(parsedResponse.recommendations)
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return {
      recommendations: parsedResponse.recommendations,
      tokenUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

/* ===== CÁC HÀM DƯỚI GIỮ NGUYÊN ===== */

export const generateGreetingMessage = (categories) => {
  const categoryList = categories
    .map((cat, index) => `${index + 1}. ${cat.name}`)
    .join("\n");

  return `Xin chào! 👋

Tôi là trợ lý AI của MacZone, rất vui được hỗ trợ bạn tìm kiếm sản phẩm Apple phù hợp nhất!

Để giúp bạn tìm được sản phẩm ưng ý, hãy cho tôi biết bạn đang tìm loại sản phẩm nào:

${categoryList}

Bạn muốn tìm loại sản phẩm nào? 😊`;
};

export const generatePriceRangeMessage = (categoryName, priceRanges) => {
  const rangeList = priceRanges
    .map((range, index) => {
      const minFormatted = range.min.toLocaleString("vi-VN");
      const maxFormatted = range.max
        ? range.max.toLocaleString("vi-VN")
        : "Trở lên";
      return `${index + 1}. ${minFormatted}₫ - ${
        range.max ? maxFormatted + "₫" : maxFormatted
      }`;
    })
    .join("\n");

  return `Tuyệt vời! Bạn đã chọn ${categoryName}. 

Để tìm được sản phẩm phù hợp với ngân sách của bạn, hãy cho tôi biết khoảng giá bạn quan tâm:

${rangeList}

Bạn muốn chọn khoảng giá nào? 💰`;
};

export const generateStoryRequestMessage = (
  categoryName,
  priceMin,
  priceMax
) => {
  const priceRange = priceMax
    ? `${priceMin.toLocaleString("vi-VN")}₫ - ${priceMax.toLocaleString(
        "vi-VN"
      )}₫`
    : `Từ ${priceMin.toLocaleString("vi-VN")}₫ trở lên`;

  return `Tuyệt vời! Tôi đã hiểu:
- Loại sản phẩm: ${categoryName}
- Khoảng giá: ${priceRange}

Bây giờ, hãy cho tôi biết thêm về nhu cầu sử dụng của bạn nhé! ✨`;
};

export default {
  analyzeAndRecommendProducts,
  generateGreetingMessage,
  generatePriceRangeMessage,
  generateStoryRequestMessage,
};
