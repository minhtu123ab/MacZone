/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0a0a",
          card: "#1a1a1a",
          border: "#2d2d2d",
          hover: "#252525",
        },
        apple: {
          blue: "#3b82f6",
          "blue-light": "#60a5fa",
          "blue-dark": "#2563eb",
          gray: "#86868b",
          "gray-light": "#d2d2d7",
        },
      },
      backgroundImage: {
        "premium-gradient":
          "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1a1a1a 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at top, #1e3a8a 0%, #0a0a0a 50%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(30, 30, 30, 0.7) 0%, rgba(20, 20, 20, 0.9) 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(59, 130, 246, 0.2)",
        glow: "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)",
        "glow-lg":
          "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)",
      },
      fontFamily: {
        "sf-pro": [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
