import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

export default function ProfileHeader({ user }) {
  return (
    <div className="flex items-center gap-6 mb-8">
      <Avatar
        size={100}
        icon={<UserOutlined />}
        className="!bg-apple-blue shadow-glow"
      />
      <div>
        <Title level={2} className="!text-white !mb-2">
          {user?.full_name || "User"}
        </Title>
        <Text className="!text-apple-gray-light !text-base">
          {user?.email}
        </Text>
        <br />
        <Text className="!text-apple-gray !text-sm">
          Member since{" "}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A"}
        </Text>
      </div>
    </div>
  );
}

ProfileHeader.propTypes = {
  user: PropTypes.shape({
    full_name: PropTypes.string,
    email: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};

