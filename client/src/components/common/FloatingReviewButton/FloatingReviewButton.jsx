import { Badge } from "antd";
import { StarOutlined } from "@ant-design/icons";
import useReviewStore from "../../../store/useReviewStore";
import useAuthStore from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function FloatingReviewButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { reviewableCount, openDrawer, fetchReviewableItems } =
    useReviewStore();

  // Fetch reviewable items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchReviewableItems();
    }
  }, [isAuthenticated, fetchReviewableItems]);

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    openDrawer();
  };

  // Don't show if not authenticated or no items to review
  if (!isAuthenticated || reviewableCount === 0) {
    return null;
  }

  return (
    <div className="group fixed bottom-32 right-8 z-50 animate-fade-in">
      <Badge
        count={reviewableCount}
        showZero={false}
        offset={[-5, 5]}
        style={{
          backgroundColor: "#f59e0b",
          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.5)",
          fontWeight: "bold",
        }}
      >
        <button
          onClick={handleClick}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-none cursor-pointer overflow-hidden"
          style={{
            boxShadow:
              "0 10px 40px rgba(245, 158, 11, 0.5), 0 0 0 0 rgba(245, 158, 11, 0.4)",
          }}
        >
          {/* Animated background pulse */}
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 animate-ping"></div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>

          {/* Star Icon */}
          <StarOutlined
            className="text-white relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all"
            style={{ fontSize: "32px" }}
          />

          {/* Shine sparkles */}
          {reviewableCount > 0 && (
            <>
              <div
                className="absolute top-2 left-2 text-yellow-200 animate-pulse"
                style={{ fontSize: "10px" }}
              >
                ⭐
              </div>
              <div
                className="absolute bottom-3 right-2 text-yellow-100 animate-pulse"
                style={{ fontSize: "8px", animationDelay: "0.3s" }}
              >
                ⭐
              </div>
            </>
          )}

          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-100 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500"></div>
        </button>
      </Badge>

      {/* Tooltip hint */}
      {reviewableCount > 0 && (
        <div className="absolute -top-14 right-0 bg-gradient-to-r from-amber-900 to-orange-800 text-white px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl border border-white/10">
          ⭐ {reviewableCount} product{reviewableCount > 1 ? "s" : ""} to review
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-amber-900 transform rotate-45 border-r border-b border-white/10"></div>
        </div>
      )}
    </div>
  );
}
