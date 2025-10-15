import { create } from "zustand";
import { message } from "antd";

const COMPARE_STORAGE_KEY = "compare_products";

// Get from sessionStorage
const getStoredCompareProducts = () => {
  try {
    const stored = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading compare products from sessionStorage:", error);
    return [];
  }
};

// Save to sessionStorage
const saveToSessionStorage = (products) => {
  try {
    sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error saving compare products to sessionStorage:", error);
  }
};

const useCompareStore = create((set, get) => ({
  // State
  compareProducts: getStoredCompareProducts(),

  // Add product to compare (max 2, same category)
  addToCompare: (product) => {
    const { compareProducts } = get();

    // Check if already in compare list
    if (compareProducts.some((p) => p._id === product._id)) {
      message.warning("This product is already in comparison list");
      return;
    }

    // Check max limit (2 products)
    if (compareProducts.length >= 2) {
      message.warning(
        "You can only compare 2 products at a time. Please remove one first."
      );
      return;
    }

    // Check same category (if there's already one product)
    if (compareProducts.length === 1) {
      const firstProduct = compareProducts[0];
      const firstCategoryId =
        typeof firstProduct.category_id === "object"
          ? firstProduct.category_id._id
          : firstProduct.category_id;
      const newCategoryId =
        typeof product.category_id === "object"
          ? product.category_id._id
          : product.category_id;

      if (firstCategoryId !== newCategoryId) {
        message.warning("You can only compare products from the same category");
        return;
      }
    }

    const newCompareProducts = [...compareProducts, product];
    set({ compareProducts: newCompareProducts });
    saveToSessionStorage(newCompareProducts);

    message.success(
      `Added ${product.name} to comparison (${newCompareProducts.length}/2)`
    );
  },

  // Remove product from compare
  removeFromCompare: (productId) => {
    const { compareProducts } = get();
    const newCompareProducts = compareProducts.filter(
      (p) => p._id !== productId
    );
    set({ compareProducts: newCompareProducts });
    saveToSessionStorage(newCompareProducts);
    message.success("Product removed from comparison");
  },

  // Clear all compare products
  clearCompare: () => {
    set({ compareProducts: [] });
    sessionStorage.removeItem(COMPARE_STORAGE_KEY);
    message.success("Comparison list cleared");
  },

  // Check if product is in compare list
  isInCompare: (productId) => {
    const { compareProducts } = get();
    return compareProducts.some((p) => p._id === productId);
  },

  // Get compare count
  getCompareCount: () => {
    const { compareProducts } = get();
    return compareProducts.length;
  },

  // Toggle product in compare
  toggleCompare: (product) => {
    const { isInCompare, addToCompare, removeFromCompare } = get();
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  },
}));

export default useCompareStore;
