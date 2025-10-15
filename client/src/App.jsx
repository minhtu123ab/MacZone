import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "antd";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CompareProductsPage from "./pages/CompareProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import FloatingCartButton from "./components/common/FloatingCartButton";
import FloatingChatButton from "./components/common/FloatingChatButton";
import FloatingReviewButton from "./components/common/FloatingReviewButton";
import { CompareFloatingBar } from "./components";
import CartDrawer from "./components/features/cart/CartDrawer";
import ChatbotDrawer from "./components/features/chatbot/ChatbotDrawer";
import ReviewDrawer from "./components/features/review/ReviewDrawer";
import OrderReviewModal from "./components/features/review/OrderReviewModal";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ReviewManagement from "./pages/admin/ReviewManagement";
import "./App.css";

const { Content } = Layout;

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <Layout className="min-h-screen">
      <Content>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/compare" element={<CompareProductsPage />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>
        </Routes>

        {/* Floating Buttons - Hidden on admin pages */}
        {!isAdminRoute && (
          <>
            <FloatingCartButton />
            <FloatingChatButton />
            <FloatingReviewButton />
            <CompareFloatingBar />
          </>
        )}

        {/* Drawers & Modals */}
        <CartDrawer />
        <ChatbotDrawer />
        <ReviewDrawer />
        <OrderReviewModal />
      </Content>
    </Layout>
  );
}

export default App;
