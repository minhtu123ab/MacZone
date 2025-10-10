import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
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
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
