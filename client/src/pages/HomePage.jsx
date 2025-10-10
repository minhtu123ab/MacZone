import { Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  AppleOutlined,
  ShoppingOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FeatureCard from "../components/common/FeatureCard";
import ProductCard from "../components/common/ProductCard";
import TestimonialCard from "../components/common/TestimonialCard";
import StatCard from "../components/common/StatCard";
import TrustBadge from "../components/common/TrustBadge";
import NewsletterSection from "../components/features/home/NewsletterSection";
import CTASection from "../components/features/home/CTASection";
import { APP_NAME, PRODUCT_CATEGORIES } from "../constants";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: <AppleOutlined className="text-4xl" />,
      title: "100% Genuine",
      description: "Authentic Apple products with official warranty",
    },
    {
      icon: <ThunderboltOutlined className="text-4xl" />,
      title: "Fast Delivery",
      description: "Express shipping to your doorstep",
    },
    {
      icon: <SafetyOutlined className="text-4xl" />,
      title: "Secure Payment",
      description: "Protected transactions & buyer guarantee",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Business Owner",
      rating: 5,
      comment:
        "Sản phẩm chính hãng, giá tốt. Đội ngũ tư vấn nhiệt tình. MacBook Pro của tôi hoạt động tuyệt vời!",
    },
    {
      name: "Trần Thị B",
      role: "Designer",
      rating: 5,
      comment:
        "Mua iPhone 15 Pro Max tại đây rất hài lòng. Giao hàng nhanh, bao bì cẩn thận. Sẽ ủng hộ lâu dài!",
    },
    {
      name: "Lê Minh C",
      role: "Developer",
      rating: 5,
      comment:
        "Dịch vụ sau bán hàng tốt, hỗ trợ nhiệt tình. iPad Pro giúp công việc của tôi hiệu quả hơn nhiều!",
    },
  ];

  const stats = [
    { number: "10K", label: "Happy Customers", suffix: "+" },
    { number: "50", label: "Products", suffix: "+" },
    { number: "5", label: "Years Experience", suffix: "+" },
    { number: "99", label: "Satisfaction Rate", suffix: "%" },
  ];

  const trustBadges = [
    { icon: <AppleOutlined />, label: "Apple Authorized Reseller" },
    { icon: <CheckCircleOutlined />, label: "Official Warranty" },
    { icon: <TrophyOutlined />, label: "Best Price Guarantee" },
    { icon: <GlobalOutlined />, label: "Nationwide Delivery" },
  ];

  return (
    <div className="min-h-screen bg-dark-bg overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-hero-gradient">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/10 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Header */}
          <Header />

          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img
              src="/logo.svg"
              alt={APP_NAME}
              className="w-32 h-32 animate-pulse"
            />
          </div>

          {/* Main Content */}
          <div className="text-center mb-16">
            <Title
              level={1}
              className="!text-6xl !font-bold !mb-6"
              style={{
                background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {APP_NAME}
            </Title>

            <Paragraph className="!text-2xl !text-apple-gray-light !mb-4">
              Premium Apple Products
            </Paragraph>

            <Paragraph className="!text-lg !text-apple-gray max-w-2xl mx-auto !mb-12">
              Experience the elegance of Apple. Discover Mac, iPhone, iPad, and
              more. Authorized reseller with genuine products and warranty.
            </Paragraph>

            {/* CTA Buttons */}
            {!isAuthenticated ? (
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/login")}
                  className="!h-14 !px-10 !text-lg !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate("/register")}
                  className="!h-14 !px-10 !text-lg !font-semibold !border-apple-blue !text-apple-blue-light hover:!bg-apple-blue/10 transition-all duration-300"
                >
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="glass px-8 py-6 rounded-2xl inline-block">
                <Title level={3} className="!text-white !mb-4">
                  Welcome back, {user?.full_name}! 👋
                </Title>
                <Paragraph className="!text-apple-gray !mb-4">
                  Ready to explore our premium Apple products?
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  className="!h-12 !px-8 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <TrustBadge key={index} icon={badge.icon} label={badge.label} />
            ))}
          </div>
        </div>
      </div>

      {/* Product Showcase Section */}
      <div className="py-20 bg-premium-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-4xl !font-bold !text-white !mb-4">
              Shop Premium Apple Products
            </Title>
            <Paragraph className="!text-lg !text-apple-gray">
              From MacBooks to iPhones, find everything Apple
            </Paragraph>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PRODUCT_CATEGORIES.map((product) => (
              <ProductCard
                key={product.name}
                name={product.name}
                image={product.image}
                description={product.description}
                onClick={() => console.log(`${product.name} clicked`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-4xl !font-bold !text-white !mb-4">
              Trusted by Thousands
            </Title>
            <Paragraph className="!text-lg !text-apple-gray">
              Numbers that speak for our quality and service
            </Paragraph>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                label={stat.label}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-premium-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-4xl !font-bold !text-white !mb-4">
              What Our Customers Say
            </Title>
            <Paragraph className="!text-lg !text-apple-gray">
              Real experiences from real customers
            </Paragraph>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                rating={testimonial.rating}
                comment={testimonial.comment}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSection />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-premium-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CTASection
            onAction={() => console.log("CTA clicked")}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
