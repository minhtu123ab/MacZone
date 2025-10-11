import { Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import useCartStore from "../../../store/useCartStore";
import useAuthStore from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function FloatingCartButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cartCount, setDrawerVisible, fetchCart } = useCartStore();

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Fetch cart data before opening drawer
    await fetchCart();
    setDrawerVisible(true);
  };

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="group fixed bottom-8 right-8 z-50 animate-fade-in">
      <Badge
        count={cartCount}
        showZero={false}
        offset={[-5, 5]}
        style={{
          backgroundColor: "#ef4444",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.5)",
          fontWeight: "bold",
        }}
      >
        <button
          onClick={handleClick}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-none cursor-pointer overflow-hidden"
          style={{
            boxShadow:
              "0 10px 40px rgba(59, 130, 246, 0.5), 0 0 0 0 rgba(59, 130, 246, 0.4)",
          }}
        >
          {/* Animated background pulse */}
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 animate-ping"></div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>

          {/* Shopping Cart Icon */}
          <ShoppingCartOutlined
            className="text-white relative z-10 group-hover:scale-110 transition-all"
            style={{ fontSize: "32px" }}
          />

          {/* Shine sparkles */}
          {cartCount > 0 && (
            <>
              <div
                className="absolute top-2 left-2 text-yellow-300 animate-pulse"
                style={{ fontSize: "10px" }}
              >
                ✨
              </div>
              <div
                className="absolute bottom-3 right-2 text-orange-300 animate-pulse"
                style={{ fontSize: "8px", animationDelay: "0.3s" }}
              >
                ✨
              </div>
            </>
          )}

          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-100 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500"></div>
        </button>
      </Badge>

      {/* Tooltip hint */}
      {cartCount > 0 && (
        <div className="absolute -top-14 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl border border-white/10">
          🛒 {cartCount} item{cartCount > 1 ? "s" : ""} in cart
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-gray-900 transform rotate-45 border-r border-b border-white/10"></div>
        </div>
      )}
    </div>
  );
}
