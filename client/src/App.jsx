import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import FloatingCartButton from "./components/common/FloatingCartButton";
import FloatingChatButton from "./components/common/FloatingChatButton";
import CartDrawer from "./components/features/cart/CartDrawer";
import ChatbotDrawer from "./components/features/chatbot/ChatbotDrawer";
import "./App.css";

const { Content } = Layout;

function App() {
  return (
    <Layout className="min-h-screen">
      <Content>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>

        {/* Floating Buttons - Always visible on all pages */}
        <FloatingCartButton />
        <FloatingChatButton />

        {/* Drawers */}
        <CartDrawer />
        <ChatbotDrawer />
      </Content>
    </Layout>
  );
}

export default App;
