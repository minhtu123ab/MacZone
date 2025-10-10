import { useState } from "react";
import { Typography, Button, Steps, App } from "antd";
import { useNavigate } from "react-router-dom";
import {
  MailOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import AuthCard from "../components/features/auth/AuthCard";
import ForgotPasswordStep1 from "../components/features/auth/ForgotPasswordStep1";
import ForgotPasswordStep2 from "../components/features/auth/ForgotPasswordStep2";
import ForgotPasswordStep3 from "../components/features/auth/ForgotPasswordStep3";
import { authAPI } from "../services/api";
import { APP_NAME, ROUTES } from "../constants";

const { Title, Text, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const { message } = App.useApp();

  // Step 1: Send verification code
  const handleSendCode = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email: values.email });

      if (response.data.success) {
        setEmail(values.email);
        setCurrentStep(1);
        message.success("Verification code sent to your email!");
      } else {
        message.error(response.data.message || "Failed to send code");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "An error occurred. Please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.verifyResetCode({
        email,
        code: values.code,
      });

      if (response.data.success) {
        setVerificationCode(values.code);
        setCurrentStep(2);
        message.success("Code verified successfully!");
      } else {
        message.error(response.data.message || "Invalid verification code");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        message.success("New verification code sent!");
      } else {
        message.error(response.data.message || "Failed to resend code");
      }
    } catch (error) {
      message.error("Failed to resend code. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.resetPassword({
        email,
        code: verificationCode,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });

      if (response.data.success) {
        setCurrentStep(3);
        message.success("Password reset successfully!");
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      } else {
        message.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Email",
      icon: <MailOutlined />,
    },
    {
      title: "Verify",
      icon: <SafetyOutlined />,
    },
    {
      title: "Reset",
      icon: <LockOutlined />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ForgotPasswordStep1 onSubmit={handleSendCode} loading={loading} />
        );
      case 1:
        return (
          <ForgotPasswordStep2
            email={email}
            onSubmit={handleVerifyCode}
            onResend={handleResendCode}
            loading={loading}
          />
        );
      case 2:
        return (
          <ForgotPasswordStep3
            onSubmit={handleResetPassword}
            loading={loading}
          />
        );
      case 3:
        return (
          <div className="text-center py-8">
            <CheckCircleOutlined className="text-6xl text-green-400 mb-4" />
            <Title level={3} className="!text-white !mb-2">
              Password Reset Successfully!
            </Title>
            <Paragraph className="!text-apple-gray !mb-6">
              Your password has been reset. You can now login with your new
              password.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="glow"
            >
              Go to Login
            </Button>
          </div>
        );
      default:
        return null;
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
              Forgot Password
            </Title>
            <Text className="!text-apple-gray">
              Reset your password in 3 easy steps
            </Text>
          </div>

          {/* Steps Progress */}
          {currentStep < 3 && (
            <div className="mb-8">
              <Steps
                current={currentStep}
                items={steps}
                className="forgot-password-steps"
              />
            </div>
          )}

          {/* Content Card */}
          <AuthCard>{renderStepContent()}</AuthCard>

          {/* Back to Login */}
          {currentStep < 3 && (
            <div className="text-center mt-6">
              <Button
                type="text"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="!text-apple-gray hover:!text-apple-blue-light"
              >
                ← Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
