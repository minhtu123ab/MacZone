import { Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

export default function ProductCard({ name, image, description, onClick }) {
  return (
    <div
      className="relative glass rounded-3xl overflow-hidden hover:shadow-glow-lg transition-all duration-500 cursor-pointer group border border-transparent hover:border-apple-blue/30"
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-apple-blue/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

      {/* Image container with better aspect ratio */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-dark-hover to-dark-card overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-blue/10 to-transparent">
            <span className="text-7xl opacity-50">📱</span>
          </div>
        )}

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>

      {/* Content section */}
      <div className="relative p-6 bg-gradient-to-b from-dark-card/80 to-dark-card z-20">
        <Title
          level={4}
          className="!text-white !mb-2 !font-bold group-hover:text-apple-blue-light transition-colors duration-300"
        >
          {name}
        </Title>
        <Paragraph className="!text-apple-gray !mb-0 !text-sm !leading-relaxed line-clamp-2">
          {description || "Explore our collection of premium products"}
        </Paragraph>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center gap-2 text-apple-blue text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
          <span>Shop Now</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
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
