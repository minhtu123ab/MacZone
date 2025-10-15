import { useState, useEffect } from "react";
import { Badge, Button, Tooltip } from "antd";
import {
  SwapOutlined,
  CloseOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useCompareStore from "../../store/useCompareStore";
import { ROUTES } from "../../constants";

export default function CompareFloatingBar() {
  const navigate = useNavigate();
  const { compareProducts, removeFromCompare, clearCompare, getCompareCount } =
    useCompareStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const count = getCompareCount();

  // Auto collapse when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If scrolled down more than 100px, auto collapse
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsExpanded(false);
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsScrolled(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (count === 0) {
    return null;
  }

  const handleCompare = () => {
    if (count < 2) {
      return;
    }
    navigate(ROUTES.COMPARE_PRODUCTS);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Compact view
  if (!isExpanded) {
    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 compare-bar-enter">
        <Tooltip title="Expand compare bar" placement="top">
          <button
            onClick={toggleExpand}
            className="relative glass rounded-2xl p-4 border border-white/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-900/90 hover:scale-110 transition-all duration-300 group"
          >
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-2xl bg-apple-blue/30 animate-ping opacity-75"></div>

            {/* Badge */}
            <Badge count={count} offset={[-5, 5]} className="relative z-10">
              <SwapOutlined className="text-white text-2xl relative z-10" />
            </Badge>

            {/* Product thumbnails (mini) */}
            <div className="absolute -top-2 -left-2 flex gap-1">
              {compareProducts.slice(0, 2).map((product, idx) => (
                <div
                  key={product._id}
                  className="w-8 h-8 rounded-lg overflow-hidden border border-white/40 shadow-lg"
                  style={{ transform: `translateX(-${idx * 4}px)` }}
                >
                  <img
                    src={product.thumbnail_url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Expand indicator */}
            <UpOutlined className="absolute -bottom-1 right-1 text-white/60 text-xs" />
          </button>
        </Tooltip>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full px-4 animate-expand-bar">
      <div className="glass rounded-2xl px-6 py-4 border border-white/20 shadow-2xl backdrop-blur-xl bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90 relative max-w-5xl mx-auto">
        {/* Collapse button */}
        <button
          onClick={toggleExpand}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 glass rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all group"
        >
          <DownOutlined className="text-white/70 text-xs group-hover:text-white transition-colors" />
        </button>

        <div className="flex items-center justify-between gap-4">
          {/* Left: Products Preview */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {compareProducts.map((product) => (
              <div key={product._id} className="relative group">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg hover:border-apple-blue/50 transition-all">
                  <img
                    src={product.thumbnail_url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={() => removeFromCompare(product._id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                >
                  <CloseOutlined className="text-white text-xs" />
                </button>
              </div>
            ))}

            {/* Placeholder for second product */}
            {count === 1 && (
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5">
                <SwapOutlined className="text-white/50 text-xl" />
              </div>
            )}
          </div>

          {/* Center: Info */}
          <div className="flex-1 text-white min-w-0 px-4">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Badge count={count} showZero color="#3b82f6" />
              <span className="text-white hidden sm:inline">
                Products Selected
              </span>
            </div>
            <div className="text-xs text-gray-300 mt-1 hidden sm:block">
              {count === 2
                ? "Ready to compare"
                : `Select ${2 - count} more product`}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<SwapOutlined />}
              onClick={handleCompare}
              disabled={count < 2}
              className={`!h-11 !px-5 !font-bold !rounded-xl transition-all duration-300 ${
                count === 2
                  ? "!bg-apple-blue hover:!bg-apple-blue-light shadow-lg shadow-apple-blue/50 hover:shadow-apple-blue/70"
                  : "!bg-gray-600 !cursor-not-allowed"
              }`}
            >
              <span className="hidden sm:inline">Compare Now</span>
              <span className="sm:hidden">Compare</span>
            </Button>

            <Button
              danger
              size="large"
              icon={<CloseOutlined />}
              onClick={clearCompare}
              className="!h-11 !px-4 !rounded-xl hover:!bg-red-600 transition-all"
              title="Clear all"
            >
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
