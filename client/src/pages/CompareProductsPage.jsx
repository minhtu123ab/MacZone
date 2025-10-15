import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Spin,
  message,
  Table,
  Tag,
  Breadcrumb,
  Empty,
  Divider,
} from "antd";
import {
  HomeOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import useCompareStore from "../store/useCompareStore";
import { productAPI } from "../services/api";
import { ROUTES } from "../constants";

const { Title, Text } = Typography;

export default function CompareProductsPage() {
  const navigate = useNavigate();
  const { compareProducts, clearCompare, removeFromCompare } =
    useCompareStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareProducts.length < 2) {
      message.warning("Please select at least 2 products to compare");
      navigate(ROUTES.PRODUCTS);
      return;
    }

    fetchCompareData();
  }, [compareProducts]);

  const fetchCompareData = async () => {
    try {
      setLoading(true);
      const productIds = compareProducts.map((p) => p._id);
      const response = await productAPI.compare(productIds);

      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      message.error("Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getMinPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price));
  };

  const getMaxPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return Math.max(...variants.map((v) => v.price));
  };

  const handleRemoveProduct = (productId) => {
    removeFromCompare(productId);
    if (compareProducts.length <= 2) {
      navigate(ROUTES.PRODUCTS);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Loading comparison..." />
        </div>
      </PageLayout>
    );
  }

  if (products.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Empty
              description="No products to compare"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(ROUTES.PRODUCTS)}
              >
                Browse Products
              </Button>
            </Empty>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            className="mb-8"
            items={[
              {
                href: ROUTES.HOME,
                title: <HomeOutlined className="text-apple-blue" />,
              },
              {
                href: ROUTES.PRODUCTS,
                title: (
                  <span className="text-gray-400 hover:text-white">
                    Products
                  </span>
                ),
              },
              {
                title: <span className="text-white">Compare Products</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Title
                level={2}
                className="!text-white !mb-2 flex items-center gap-3"
              >
                <SwapOutlined className="text-apple-blue" />
                Product Comparison
              </Title>
              <Text className="!text-gray-400">
                Compare specifications and features side by side
              </Text>
            </div>
            <Button
              danger
              size="large"
              icon={<CloseOutlined />}
              onClick={() => {
                clearCompare();
                navigate(ROUTES.PRODUCTS);
              }}
              className="!rounded-xl"
            >
              Clear All
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-2 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="glass rounded-3xl p-6 border border-white/10 relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveProduct(product._id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                >
                  <CloseOutlined className="text-white text-sm" />
                </button>

                {/* Product Image */}
                <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-dark-card">
                  <img
                    src={product.thumbnail_url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <Title level={4} className="!text-white !mb-2">
                      {product.name}
                    </Title>
                    <Tag color="blue">{product.category_id?.name}</Tag>
                  </div>

                  {/* Price Range */}
                  <div className="glass rounded-xl p-4 bg-gradient-to-r from-apple-blue/10 to-purple-500/10">
                    <Text className="!text-gray-400 !text-xs !block mb-1">
                      Price Range
                    </Text>
                    <Title level={5} className="!text-apple-blue !mb-0">
                      {getMinPrice(product.variants) ===
                      getMaxPrice(product.variants)
                        ? formatPrice(getMinPrice(product.variants))
                        : `${formatPrice(
                            getMinPrice(product.variants)
                          )} - ${formatPrice(getMaxPrice(product.variants))}`}
                    </Title>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
                    <Text className="!text-gray-400">Rating</Text>
                    <Text className="!text-white !font-semibold">
                      ⭐ {product.average_rating?.toFixed(1) || "N/A"} (
                      {product.review_count || 0} reviews)
                    </Text>
                  </div>

                  {/* Specifications */}
                  {product.specifications &&
                    Object.keys(product.specifications).length > 0 && (
                      <>
                        <Divider className="!bg-white/10 !my-4" />
                        <div>
                          <Text className="!text-white !font-bold !text-sm !block mb-3">
                            Technical Specifications
                          </Text>
                          <div className="space-y-2">
                            {Object.entries(product.specifications).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  <Text className="!text-gray-400 !text-sm">
                                    {key}
                                  </Text>
                                  <Text className="!text-white !font-medium !text-sm text-right">
                                    {value}
                                  </Text>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <>
                      <Divider className="!bg-white/10 !my-4" />
                      <div>
                        <Text className="!text-white !font-bold !text-sm !block mb-3">
                          Available Variants ({product.variants.length})
                        </Text>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {product.variants.map((variant) => (
                            <div
                              key={variant._id}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
                            >
                              <div>
                                <Text className="!text-white !text-sm !font-medium !block">
                                  {variant.color}{" "}
                                  {variant.storage && `- ${variant.storage}`}
                                </Text>
                                <Text className="!text-gray-400 !text-xs">
                                  Stock: {variant.stock}
                                </Text>
                              </div>
                              <Text className="!text-apple-blue !font-bold">
                                {formatPrice(variant.price)}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
                    <Text className="!text-gray-400">In Stock</Text>
                    <div className="flex items-center gap-2">
                      {product.variants?.some((v) => v.stock > 0) ? (
                        <>
                          <CheckCircleOutlined className="text-green-500" />
                          <Text className="!text-green-500 !font-semibold">
                            Yes
                          </Text>
                        </>
                      ) : (
                        <>
                          <CloseCircleOutlined className="text-red-500" />
                          <Text className="!text-red-500 !font-semibold">
                            No
                          </Text>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate(`/products/${product._id}`)}
                    block
                    className="!h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !rounded-xl !border-none shadow-lg shadow-apple-blue/50 hover:shadow-apple-blue/70 transition-all duration-300"
                  >
                    View Product
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
