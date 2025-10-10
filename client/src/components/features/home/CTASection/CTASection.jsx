import { Typography, Button } from "antd";
import { ShoppingOutlined, AppleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

export default function CTASection({ onAction, isAuthenticated }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-apple-blue/20 via-apple-blue-dark/20 to-transparent p-12 md:p-16">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-apple-blue-dark/10 rounded-full blur-3xl"></div>

      <div className="relative text-center">
        <Title level={1} className="!text-white !mb-4">
          Ready to Upgrade?
        </Title>
        <Paragraph className="!text-apple-gray-light !text-xl !mb-8 max-w-2xl mx-auto">
          Experience the perfect blend of performance and elegance with genuine
          Apple products. Get started today!
        </Paragraph>
        <div className="flex gap-4 justify-center flex-wrap">
          {isAuthenticated ? (
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={onAction}
              className="!h-14 !px-10 !text-lg !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
            >
              Start Shopping Now
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                size="large"
                icon={<AppleOutlined />}
                onClick={onAction}
                className="!h-14 !px-10 !text-lg !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
              >
                Get Started
              </Button>
              <Button
                size="large"
                onClick={onAction}
                className="!h-14 !px-10 !text-lg !font-semibold !border-apple-blue !text-apple-blue-light hover:!bg-apple-blue/10 transition-all duration-300"
              >
                Learn More
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

CTASection.propTypes = {
  onAction: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};
