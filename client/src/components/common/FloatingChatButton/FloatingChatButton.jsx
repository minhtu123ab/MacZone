import { RobotOutlined } from "@ant-design/icons";
import useChatbotStore from "../../../store/useChatbotStore";
import useAuthStore from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function FloatingChatButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setDrawerVisible } = useChatbotStore();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setDrawerVisible(true);
  };

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
        .sparkle-1 { animation: sparkle 2s ease-in-out infinite; }
        .sparkle-2 { animation: sparkle 2s ease-in-out infinite 0.5s; }
      `}</style>
      <div className="group fixed bottom-8 left-8 z-50 animate-fade-in">
        <button
          onClick={handleClick}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-none cursor-pointer overflow-hidden"
          style={{
            boxShadow:
              "0 10px 40px rgba(168, 85, 247, 0.5), 0 0 0 0 rgba(168, 85, 247, 0.4)",
          }}
        >
          {/* Animated background pulse */}
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 animate-ping"></div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>

          {/* AI Robot Icon */}
          <RobotOutlined
            className="text-white relative z-10 group-hover:scale-110 transition-all"
            style={{ fontSize: "32px" }}
          />

          {/* Sparkle effects */}
          <div
            className="absolute top-2 right-2 text-yellow-300 sparkle-1"
            style={{ fontSize: "10px" }}
          >
            ✨
          </div>
          <div
            className="absolute bottom-3 left-2 text-blue-300 sparkle-2"
            style={{ fontSize: "8px" }}
          >
            ✨
          </div>

          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-100 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500"></div>

          {/* AI active indicator dot */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50 border-2 border-white"></div>
        </button>

        {/* Tooltip hint */}
        <div className="absolute -top-14 left-0 bg-gradient-to-r from-purple-900 to-purple-800 text-white px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl border border-white/10">
          🤖 Chat với AI Assistant
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-purple-900 transform rotate-45 border-r border-b border-white/10"></div>
        </div>
      </div>
    </>
  );
}
