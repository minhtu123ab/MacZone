import { useState, useEffect } from "react";
import { Typography, Button, Spin, message } from "antd";
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
import {
  useScrollAnimation,
  useStaggerAnimation,
} from "../hooks/useScrollAnimation";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FeatureCard from "../components/common/FeatureCard";
import ProductCard from "../components/common/ProductCard";
import TestimonialCard from "../components/common/TestimonialCard";
import StatCard from "../components/common/StatCard";
import TrustBadge from "../components/common/TrustBadge";
import NewsletterSection from "../components/features/home/NewsletterSection";
import CTASection from "../components/features/home/CTASection";
import { APP_NAME } from "../constants";
import { categoryAPI, reviewAPI } from "../services/api";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Scroll animation hooks for different sections
  const trustBadgesAnimation = useScrollAnimation({ threshold: 0.2 });
  const productShowcaseAnimation = useScrollAnimation({ threshold: 0.15 });
  const statsAnimation = useScrollAnimation({ threshold: 0.2 });
  const testimonialsAnimation = useScrollAnimation({ threshold: 0.15 });
  const newsletterAnimation = useScrollAnimation({ threshold: 0.2 });
  const ctaAnimation = useScrollAnimation({ threshold: 0.2 });

  // Staggered animations for grid items
  const featureAnimations = useStaggerAnimation(3, { staggerDelay: 150 });
  const trustBadgeAnimations = useStaggerAnimation(4, { staggerDelay: 150 });
  const categoryAnimations = useStaggerAnimation(categories.length, {
    staggerDelay: 150,
  });
  const testimonialAnimations = useStaggerAnimation(reviews.length, {
    staggerDelay: 200,
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAll();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await reviewAPI.getFeaturedReviews();
        setReviews(response.data.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        message.error("Failed to load reviews");
      } finally {
        setLoadingReviews(false);
      }
      setLoadingReviews(false);
    };

    fetchReviews();
  }, []);

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
          <div className="flex justify-center mb-8">
            <img
              src="/logo.svg"
              alt={APP_NAME}
              className="w-36 h-36 animate-pulse"
            />
          </div>

          {/* Main Content */}
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <Title
                level={1}
                className="relative !mb-8 !text-5xl sm:!text-6xl md:!text-7xl whitespace-nowrap"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #0dd6f5 0%, #3b9dff 50%, #00b8d9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  filter:
                    "drop-shadow(0 0 15px rgba(6, 182, 212, 0.3)) drop-shadow(0 4px 12px rgba(6, 182, 212, 0.2))",
                }}
              >
                {APP_NAME}
              </Title>

              <div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.12) 0%, transparent 60%)",
                  filter: "blur(50px)",
                  transform: "scale(1.1)",
                }}
              ></div>
            </div>

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
                  onClick={() => navigate("/products")}
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
              <div
                key={index}
                ref={featureAnimations[index].ref}
                className={`scroll-animate ${
                  featureAnimations[index].isVisible ? "animate-fade-up" : ""
                }`}
                style={{
                  animationDelay: `${featureAnimations[index].delay}ms`,
                }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div ref={trustBadgesAnimation.ref} className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                ref={trustBadgeAnimations[index].ref}
                className={`scroll-animate ${
                  trustBadgeAnimations[index].isVisible
                    ? "animate-scale-in"
                    : ""
                }`}
                style={{
                  animationDelay: `${trustBadgeAnimations[index].delay}ms`,
                }}
              >
                <TrustBadge icon={badge.icon} label={badge.label} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Showcase Section */}
      <div
        ref={productShowcaseAnimation.ref}
        className="py-20 bg-premium-gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 scroll-animate ${
              productShowcaseAnimation.isVisible ? "animate-fade-down" : ""
            }`}
          >
            <Title level={2} className="!text-4xl !font-bold !text-white !mb-4">
              Shop Premium Apple Products
            </Title>
            <Paragraph className="!text-lg !text-apple-gray">
              From MacBooks to iPhones, find everything Apple
            </Paragraph>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Loading categories..." />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {categories.map((category, index) => (
                <div
                  key={category._id}
                  ref={categoryAnimations[index]?.ref}
                  className={`scroll-animate ${
                    categoryAnimations[index]?.isVisible
                      ? "animate-zoom-in"
                      : ""
                  }`}
                  style={{
                    animationDelay: `${
                      categoryAnimations[index]?.delay || 0
                    }ms`,
                  }}
                >
                  <ProductCard
                    name={category.name}
                    image={category.image}
                    description={category.description}
                    onClick={() =>
                      navigate(`/products?category=${category._id}`)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Paragraph className="!text-lg !text-apple-gray">
                No categories available at the moment
              </Paragraph>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsAnimation.ref} className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 scroll-animate ${
              statsAnimation.isVisible ? "animate-fade-down" : ""
            }`}
          >
            <Title level={2} className="!text-4xl !font-bold !text-white !mb-4">
              Trusted by Thousands
            </Title>
            <Paragraph className="!text-lg !text-apple-gray">
              Numbers that speak for our quality and service
            </Paragraph>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${
                  statsAnimation.isVisible ? "animate-bounce-in" : "opacity-0"
                }`}
                style={{
                  animationDelay: statsAnimation.isVisible
                    ? `${index * 150}ms`
                    : "0ms",
                }}
              >
                <StatCard
                  number={stat.number}
                  label={stat.label}
                  suffix={stat.suffix}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div
        ref={testimonialsAnimation.ref}
        className="py-20 bg-premium-gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 scroll-animate ${
              testimonialsAnimation.isVisible ? "animate-fade-down" : ""
            }`}
          >
            <Title level={2} className="!text-4xl !font-bold !text-white !mb-4">
              What Our Customers Say
            </Title>
            <Paragraph className="!text-lg !text-apple-gray">
              Real experiences from real customers
            </Paragraph>
          </div>

          {loadingReviews ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Loading reviews..." />
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((testimonial, index) => (
                <div
                  key={index}
                  ref={testimonialAnimations[index].ref}
                  className={`scroll-animate ${
                    testimonialAnimations[index].isVisible
                      ? "animate-fade-up"
                      : ""
                  }`}
                  style={{
                    animationDelay: `${testimonialAnimations[index].delay}ms`,
                  }}
                >
                  <TestimonialCard
                    name={testimonial.user.full_name}
                    role={testimonial.user.role}
                    rating={testimonial.rating}
                    comment={testimonial.comment}
                    productName={testimonial.product.name}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Paragraph className="!text-lg !text-apple-gray">
                No reviews available at the moment
              </Paragraph>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div ref={newsletterAnimation.ref} className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`scroll-animate ${
              newsletterAnimation.isVisible ? "animate-scale-in" : ""
            }`}
          >
            <NewsletterSection />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaAnimation.ref} className="py-20 bg-premium-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`scroll-animate ${
              ctaAnimation.isVisible ? "animate-fade-up" : ""
            }`}
          >
            <CTASection
              onAction={() => navigate("/products")}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
