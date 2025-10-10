import { Typography, Rate, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Paragraph, Text } = Typography;

export default function TestimonialCard({
  name,
  role,
  rating,
  comment,
  avatar,
}) {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
      <Rate disabled defaultValue={rating} className="mb-4 !text-apple-blue" />
      <Paragraph className="!text-apple-gray-light !text-base !mb-6 italic">
        &quot;{comment}&quot;
      </Paragraph>
      <div className="flex items-center gap-3">
        {avatar ? (
          <Avatar src={avatar} size={48} />
        ) : (
          <Avatar
            icon={<UserOutlined />}
            size={48}
            className="!bg-apple-blue/20"
          />
        )}
        <div>
          <Text className="!text-white !font-semibold !block">{name}</Text>
          <Text className="!text-apple-gray !text-sm">{role}</Text>
        </div>
      </div>
    </div>
  );
}

TestimonialCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  comment: PropTypes.string.isRequired,
  avatar: PropTypes.string,
};
