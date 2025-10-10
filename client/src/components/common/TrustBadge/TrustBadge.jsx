import { Typography } from "antd";
import PropTypes from "prop-types";

const { Text } = Typography;

export default function TrustBadge({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <div className="text-4xl text-apple-blue">{icon}</div>
      <Text className="!text-apple-gray-light !text-sm text-center">
        {label}
      </Text>
    </div>
  );
}

TrustBadge.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
};
