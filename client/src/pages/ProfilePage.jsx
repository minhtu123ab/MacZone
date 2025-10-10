import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Card,
  Form,
  App,
  Divider,
  Space,
  Tabs,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { authAPI } from "../services/api";
import PageLayout from "../components/layout/PageLayout";
import ProfileHeader from "../components/features/profile/ProfileHeader";
import ProfileInfo from "../components/features/profile/ProfileInfo";
import ChangePassword from "../components/features/profile/ChangePassword";
import { ROUTES } from "../constants";

const { Title, Paragraph, Text } = Typography;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const { message } = App.useApp();

  // Load profile on mount
  useEffect(() => {
    if (!user) {
      fetchProfile();
    } else {
      profileForm.setFieldsValue({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, fetchProfile, profileForm]);

  // Update profile information
  const handleUpdateProfile = async (values) => {
    setLoadingProfile(true);
    try {
      const result = await updateProfile(values);

      if (result.success) {
        message.success("Profile updated successfully!");
      } else {
        message.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      message.error("An error occurred. Please try again!");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (values) => {
    setLoadingPassword(true);
    try {
      const response = await authAPI.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });

      if (response.data.success) {
        message.success("Password changed successfully!");
        passwordForm.resetFields();
      } else {
        message.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "An error occurred. Please try again!"
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  const profileTab = (
    <div className="space-y-6">
      <ProfileHeader user={user} />
      <Divider className="!border-dark-border" />
      <ProfileInfo
        form={profileForm}
        onSubmit={handleUpdateProfile}
        loading={loadingProfile}
      />
    </div>
  );

  const passwordTab = (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={4} className="!text-white !mb-2">
          Change Password
        </Title>
        <Paragraph className="!text-apple-gray">
          Ensure your account is using a long, random password to stay secure.
        </Paragraph>
      </div>
      <ChangePassword
        form={passwordForm}
        onSubmit={handleChangePassword}
        loading={loadingPassword}
      />
    </div>
  );

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.HOME)}
            className="!text-apple-gray hover:!text-apple-blue-light !mb-6"
          >
            Back to Home
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="!text-white !mb-2">
                My Profile
              </Title>
              <Paragraph className="!text-apple-gray !mb-0">
                Manage your account settings and preferences
              </Paragraph>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="glass glow-sm !border-dark-border">
          <Tabs
            defaultActiveKey="profile"
            size="large"
            items={[
              {
                key: "profile",
                label: (
                  <span className="flex items-center gap-2">
                    <UserOutlined />
                    Profile Information
                  </span>
                ),
                children: profileTab,
              },
              {
                key: "password",
                label: (
                  <span className="flex items-center gap-2">
                    <LockOutlined />
                    Change Password
                  </span>
                ),
                children: passwordTab,
              },
            ]}
          />
        </Card>

        {/* Account Info Card */}
        <Card className="glass glow-sm !border-dark-border mt-6">
          <Title level={4} className="!text-white !mb-4">
            Account Information
          </Title>
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex justify-between items-center">
              <Text className="!text-apple-gray">Account Status</Text>
              <Text className="!text-green-400 !font-semibold">Active</Text>
            </div>
            <Divider className="!border-dark-border !my-2" />
            <div className="flex justify-between items-center">
              <Text className="!text-apple-gray">Role</Text>
              <Text className="!text-apple-blue-light !font-semibold capitalize">
                {user?.role || "User"}
              </Text>
            </div>
            <Divider className="!border-dark-border !my-2" />
            <div className="flex justify-between items-center">
              <Text className="!text-apple-gray">Last Updated</Text>
              <Text className="!text-white">
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "N/A"}
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </PageLayout>
  );
}
