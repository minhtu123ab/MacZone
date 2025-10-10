import PropTypes from "prop-types";

export default function PageLayout({ children, showBackgroundEffects = true }) {
  return (
    <div className="min-h-screen bg-dark-bg bg-hero-gradient">
      {/* Background Effects */}
      {showBackgroundEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-apple-blue/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-apple-blue-dark/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showBackgroundEffects: PropTypes.bool,
};
