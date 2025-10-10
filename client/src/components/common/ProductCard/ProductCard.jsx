import { Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

export default function ProductCard({ name, image, description, onClick }) {
  return (
    <div
      className="glass rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square bg-dark-hover overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <Title level={4} className="!text-white !mb-2">
          {name}
        </Title>
        <Paragraph className="!text-apple-gray !mb-0">
          {description || "Explore collection"}
        </Paragraph>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string,
  description: PropTypes.string,
  onClick: PropTypes.func,
};
