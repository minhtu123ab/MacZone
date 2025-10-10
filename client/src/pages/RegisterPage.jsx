import { Typography, Button, App } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import PageLayout from "../components/layout/PageLayout";
import AuthCard from "../components/features/auth/AuthCard";
import RegisterForm from "../components/features/auth/RegisterForm";
import { APP_NAME, ROUTES } from "../constants";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const { message } = App.useApp();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const { confirm_password, agree, ...registerData } = values;
      const result = await register(registerData);

      if (result.success) {
        message.success("Registration successful! Please login.");
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 500);
      } else {
        message.error(result.error || "Registration failed!");
      }
    } catch (error) {
      message.error("An error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.svg" alt={APP_NAME} className="w-20 h-20 mb-4" />
            <Title level={2} className="!text-white !mb-2">
              Join {APP_NAME}
            </Title>
            <Text className="!text-apple-gray">
              Create your account and start shopping
            </Text>
          </div>

          {/* Register Card */}
          <AuthCard>
            <RegisterForm onSubmit={handleRegister} loading={loading} />

            <div className="text-center pt-4 border-t border-dark-border mt-4">
              <Text className="!text-apple-gray">
                Already have an account?{" "}
              </Text>
              <Button
                type="link"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="!p-0 !text-apple-blue-light hover:!text-apple-blue !font-semibold"
              >
                Sign In
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
