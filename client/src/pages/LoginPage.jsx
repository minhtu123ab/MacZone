import { Typography, Button, App } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import PageLayout from "../components/layout/PageLayout";
import AuthCard from "../components/features/auth/AuthCard";
import LoginForm from "../components/features/auth/LoginForm";
import { APP_NAME, ROUTES } from "../constants";

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { message } = App.useApp();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);

      if (result.success) {
        message.success("Login successful! Welcome back!");
        await new Promise((resolve) => setTimeout(resolve, 300));
        navigate(ROUTES.HOME, { replace: true });
      } else {
        message.error(result.error || "Login failed!");
      }
    } catch (error) {
      message.error("An error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate(ROUTES.FORGOT_PASSWORD);
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.svg" alt={APP_NAME} className="w-20 h-20 mb-4" />
            <Title level={2} className="!text-white !mb-2">
              Welcome Back
            </Title>
            <Text className="!text-apple-gray">
              Sign in to continue to {APP_NAME}
            </Text>
          </div>

          {/* Login Card */}
          <AuthCard>
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              onForgotPassword={handleForgotPassword}
            />

            <div className="text-center pt-4 border-t border-dark-border mt-4">
              <Text className="!text-apple-gray">Don't have an account? </Text>
              <Button
                type="link"
                onClick={() => navigate(ROUTES.REGISTER)}
                className="!p-0 !text-apple-blue-light hover:!text-apple-blue !font-semibold"
              >
                Create Account
              </Button>
            </div>
          </AuthCard>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Button
              type="text"
              onClick={() => navigate(ROUTES.HOME)}
              className="!text-apple-gray hover:!text-apple-blue-light"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
