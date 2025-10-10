import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme, App as AntApp } from "antd";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#3b82f6",
            colorBgContainer: "#1a1a1a",
            colorBgElevated: "#1e1e1e",
            colorBorder: "#2d2d2d",
            colorText: "#ffffff",
            colorTextSecondary: "#86868b",
            borderRadius: 12,
            fontSize: 15,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          },
          components: {
            Button: {
              controlHeight: 44,
              borderRadius: 10,
              fontWeight: 600,
            },
            Input: {
              controlHeight: 44,
              borderRadius: 10,
              fontSize: 14,
              paddingBlock: 10,
              paddingInline: 12,
            },
            Card: {
              borderRadius: 16,
            },
          },
        }}
      >
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
