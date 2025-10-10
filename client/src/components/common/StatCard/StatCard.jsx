import { Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

export default function StatCard({ number, label, suffix = "" }) {
  return (
    <div className="text-center">
      <Title
        level={1}
        className="!text-5xl !font-bold !mb-2"
        style={{
          background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {number}
        {suffix}
      </Title>
      <Text className="!text-apple-gray-light !text-lg">{label}</Text>
    </div>
  );
}

StatCard.propTypes = {
  number: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  suffix: PropTypes.string,
};
