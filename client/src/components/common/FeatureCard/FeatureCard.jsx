import { Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass rounded-2xl p-8 text-center hover:shadow-glow transition-all duration-300">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-apple-blue/10 text-apple-blue mb-4">
        {icon}
      </div>
      <Title level={4} className="!text-white !mb-2">
        {title}
      </Title>
      <Paragraph className="!text-apple-gray !mb-0">{description}</Paragraph>
    </div>
  );
}

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
