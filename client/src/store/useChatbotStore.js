import { create } from "zustand";
import { chatbotAPI } from "../services/api";
import { message } from "antd";

const useChatbotStore = create((set, get) => ({
  // State
  drawerVisible: false,
  loading: false,
  currentStep: "greeting", // greeting, category, priceRange, story, recommendations

  // Data
  greeting: "",
  categories: [],
  selectedCategory: null,
  priceRanges: [],
  selectedPriceRange: null,
  storyPrompt: "",
  userStory: "",
  recommendations: [],

  // Chat history
  messages: [],

  // Actions
  setDrawerVisible: (visible) => {
    set({ drawerVisible: visible });
    if (visible) {
      get().startChat();
    } else {
      // Reset on close
      get().resetChat();
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, { ...message, timestamp: new Date() }],
    }));
  },

  // Step 1: Start chat and get greeting + categories
  startChat: async () => {
    try {
      set({ loading: true, currentStep: "greeting", messages: [] });

      const response = await chatbotAPI.start();
      const { greeting, categories } = response.data.data;

      // Add bot greeting message
      set({
        greeting,
        categories,
        loading: false,
      });

      get().addMessage({
        type: "bot",
        content: greeting,
        data: { categories },
      });

      // Move to category selection
      set({ currentStep: "category" });

      return { success: true };
    } catch (error) {
      set({ loading: false });

      // Add friendly error message to chat with restart options
      get().addMessage({
        type: "bot",
        content: "😔 Xin lỗi, hiện tại không thể kết nối với AI. Vui lòng thử lại sau hoặc bắt đầu cuộc trò chuyện mới.",
        data: { showErrorOptions: true },
      });

      set({ currentStep: "error" });
      return { success: false, error };
    }
  },

  // Step 2: Select category and get price ranges
  selectCategory: async (category) => {
    try {
      set({ loading: true, selectedCategory: category });

      // Add user message
      get().addMessage({
        type: "user",
        content: category.name,
      });

      const response = await chatbotAPI.getPriceRanges(category.id);
      const { message: botMessage, priceRanges } = response.data.data;

      // Add bot message
      get().addMessage({
        type: "bot",
        content: botMessage,
        data: { priceRanges },
      });

      set({
        priceRanges,
        currentStep: "priceRange",
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });

      // Add friendly error message to chat with restart options
      get().addMessage({
        type: "bot",
        content: "😔 Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại hoặc bắt đầu cuộc trò chuyện mới.",
        data: { showErrorOptions: true },
      });

      set({ currentStep: "error" });
      return { success: false, error };
    }
  },

  // Step 3: Select price range and get story prompt
  selectPriceRange: async (priceRange) => {
    try {
      set({ loading: true, selectedPriceRange: priceRange });

      // Add user message
      get().addMessage({
        type: "user",
        content: priceRange.label,
      });

      const response = await chatbotAPI.getStoryRequest({
        categoryId: get().selectedCategory.id,
        priceRangeId: priceRange.id,
      });
      const { message: botMessage } = response.data.data;

      // Add bot message
      get().addMessage({
        type: "bot",
        content: botMessage,
      });

      set({
        storyPrompt: botMessage,
        currentStep: "story",
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });

      // Add friendly error message to chat with restart options
      get().addMessage({
        type: "bot",
        content: "😔 Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại hoặc bắt đầu cuộc trò chuyện mới.",
        data: { showErrorOptions: true },
      });

      set({ currentStep: "error" });
      return { success: false, error };
    }
  },

  // Step 4: Submit story and get recommendations
  submitStory: async (story) => {
    if (!story || story.trim().length < 10) {
      message.warning("Vui lòng nhập mô tả chi tiết hơn (ít nhất 10 ký tự)");
      return { success: false };
    }

    try {
      set({ loading: true, userStory: story });

      // Add user message
      get().addMessage({
        type: "user",
        content: story,
      });

      // Add loading message
      get().addMessage({
        type: "bot",
        content: "Đang phân tích và tìm kiếm sản phẩm phù hợp cho bạn...",
        isLoading: true,
      });

      const response = await chatbotAPI.getRecommendations({
        categoryId: get().selectedCategory.id,
        priceRangeId: get().selectedPriceRange.id,
        userStory: story,
      });

      const { recommendations, tokensUsed } = response.data.data;

      // Remove loading message and add result
      set((state) => ({
        messages: state.messages.filter((msg) => !msg.isLoading),
      }));

      const message =
        recommendations.length === 1
          ? `✨ Đây là sản phẩm phù hợp nhất với bạn:`
          : `✨ Đây là ${recommendations.length} sản phẩm phù hợp nhất với bạn:`;

      get().addMessage({
        type: "bot",
        content: message,
        data: { recommendations, tokensUsed },
      });

      // Add completion message with restart options
      setTimeout(() => {
        get().addMessage({
          type: "bot",
          content: "Bạn có muốn bắt đầu một cuộc trò chuyện mới không? 💬",
          data: { showRestartOptions: true },
        });
      }, 500);

      set({
        recommendations,
        currentStep: "completed",
        loading: false,
      });

      return { success: true, data: recommendations };
    } catch (error) {
      // Remove loading message
      set((state) => ({
        messages: state.messages.filter((msg) => !msg.isLoading),
        loading: false,
      }));

      // Add friendly error message to chat with restart options
      get().addMessage({
        type: "bot",
        content: "😔 Xin lỗi, không thể lấy đề xuất sản phẩm. Vui lòng thử lại hoặc bắt đầu cuộc trò chuyện mới.",
        data: { showErrorOptions: true },
      });

      set({ currentStep: "error" });
      return { success: false, error };
    }
  },

  // Reset chat
  resetChat: () => {
    set({
      currentStep: "greeting",
      greeting: "",
      categories: [],
      selectedCategory: null,
      priceRanges: [],
      selectedPriceRange: null,
      storyPrompt: "",
      userStory: "",
      recommendations: [],
      messages: [],
      loading: false,
    });
  },

  // Start new conversation
  startNewChat: () => {
    get().resetChat();
    get().startChat();
  },
}));

export default useChatbotStore;
