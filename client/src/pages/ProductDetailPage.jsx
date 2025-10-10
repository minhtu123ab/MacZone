import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Button,
  InputNumber,
  Tag,
  Spin,
  message,
  Breadcrumb,
  Divider,
  Card,
} from "antd";
import {
  ShoppingCartOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import { productAPI } from "../services/api";
import { ROUTES } from "../constants";

const { Title, Paragraph, Text } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch product and variants
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(id);
        const productData = response.data.data;
        setProduct(productData);
        setVariants(productData.variants || []);

        // Set images from ProductImage table
        const productImages = productData.images || [];
        const imageUrls =
          productImages.length > 0
            ? productImages.map((img) => img.image_url)
            : productData.thumbnail_url
            ? [productData.thumbnail_url]
            : [];
        setImages(imageUrls);

        // Auto-select first available variant
        if (productData.variants && productData.variants.length > 0) {
          const firstAvailable = productData.variants.find(
            (v) => v.is_active && v.stock > 0
          );
          setSelectedVariant(firstAvailable || productData.variants[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        message.error("Failed to load product details");
        navigate(ROUTES.PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      message.warning("Please select a variant");
      return;
    }

    if (selectedVariant.stock === 0) {
      message.error("This variant is out of stock");
      return;
    }

    if (quantity > selectedVariant.stock) {
      message.error(`Only ${selectedVariant.stock} items available in stock`);
      return;
    }

    // TODO: Implement cart functionality
    message.success(
      `Added ${quantity} item(s) to cart: ${product.name} - ${selectedVariant.color} ${selectedVariant.storage}`
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Group variants by color and storage
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const storages = [...new Set(variants.map((v) => v.storage).filter(Boolean))];

  const getVariantByOptions = (color, storage) => {
    return variants.find((v) => v.color === color && v.storage === storage);
  };

  // Get available colors for selected storage
  const getAvailableColors = () => {
    if (!selectedVariant?.storage) return colors;
    return colors.filter((color) => {
      const variant = getVariantByOptions(color, selectedVariant.storage);
      return variant && variant.is_active && variant.stock > 0;
    });
  };

  // Get available storages for selected color
  const getAvailableStorages = () => {
    if (!selectedVariant?.color) return storages;
    return storages.filter((storage) => {
      const variant = getVariantByOptions(selectedVariant.color, storage);
      return variant && variant.is_active && variant.stock > 0;
    });
  };

  // Check if a color is available for current storage selection
  const isColorAvailable = (color) => {
    if (!selectedVariant?.storage) {
      // If no storage selected, check if color has any stock
      return variants.some(
        (v) => v.color === color && v.is_active && v.stock > 0
      );
    }
    // Check if this specific color + storage combo exists and has stock
    const variant = getVariantByOptions(color, selectedVariant.storage);
    return variant && variant.is_active && variant.stock > 0;
  };

  // Check if a storage is available for current color selection
  const isStorageAvailable = (storage) => {
    if (!selectedVariant?.color) {
      // If no color selected, check if storage has any stock
      return variants.some(
        (v) => v.storage === storage && v.is_active && v.stock > 0
      );
    }
    // Check if this specific color + storage combo exists and has stock
    const variant = getVariantByOptions(selectedVariant.color, storage);
    return variant && variant.is_active && variant.stock > 0;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Loading product..." />
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return null;
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
                title: <span className="text-white">{product.name}</span>,
              },
            ]}
          />

          <Row gutter={[48, 48]}>
            {/* Product Images Gallery */}
            <Col xs={24} md={12}>
              <div className="sticky top-24 space-y-4">
                {/* Main Image */}
                <div className="glass rounded-3xl overflow-hidden aspect-square bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-dark-card border border-white/10">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-blue/10 to-transparent">
                      <span className="text-9xl opacity-30">📱</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                          selectedImageIndex === index
                            ? "ring-2 ring-apple-blue scale-105"
                            : "ring-1 ring-white/10 hover:ring-white/30"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Product Info */}
            <Col xs={24} md={12}>
              <div className="space-y-6">
                {/* Category Badge */}
                {product.category_id && (
                  <div className="inline-flex">
                    <span className="px-4 py-1.5 rounded-full glass border border-apple-blue/30 text-apple-blue text-sm font-semibold">
                      {product.category_id.name}
                    </span>
                  </div>
                )}

                {/* Product Name */}
                <Title level={2} className="!text-white !mb-2 !text-3xl">
                  {product.name}
                </Title>

                {/* Rating */}
                {product.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarFilled
                          key={i}
                          className={
                            i < Math.round(product.average_rating)
                              ? "text-yellow-500"
                              : "text-gray-600"
                          }
                        />
                      ))}
                    </div>
                    <Text className="!text-apple-gray">
                      {product.average_rating.toFixed(1)} (
                      {product.review_count} reviews)
                    </Text>
                  </div>
                )}

                {/* Description */}
                <Paragraph className="!text-apple-gray !text-lg">
                  {product.description}
                </Paragraph>

                <Divider className="!bg-dark-border" />

                {/* Price */}
                {selectedVariant && (
                  <div>
                    <Text className="!text-apple-gray !text-sm !block mb-2">
                      Price
                    </Text>
                    <Title level={3} className="!text-apple-blue !mb-0">
                      {formatPrice(selectedVariant.price)}
                    </Title>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <Text className="!text-white !text-base !font-semibold !block mb-3">
                      Color:{" "}
                      <span className="text-apple-blue">
                        {selectedVariant?.color || "Select"}
                      </span>
                    </Text>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => {
                        const available = isColorAvailable(color);
                        const isSelected = selectedVariant?.color === color;

                        return (
                          <Button
                            key={color}
                            size="large"
                            type={isSelected ? "primary" : "default"}
                            disabled={!available}
                            onClick={() => {
                              const variant = getVariantByOptions(
                                color,
                                selectedVariant?.storage || storages[0]
                              );
                              if (variant) setSelectedVariant(variant);
                            }}
                            className={`!px-6 !rounded-xl transition-all duration-300 ${
                              isSelected
                                ? "!bg-apple-blue !border-apple-blue !text-white shadow-lg shadow-apple-blue/50"
                                : available
                                ? "glass !border-white/20 !text-white hover:!border-apple-blue/50"
                                : "!bg-gray-900 !border-gray-800 !text-gray-600 opacity-40 cursor-not-allowed"
                            }`}
                          >
                            {color}
                            {!available && <span className="ml-2">✕</span>}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Storage Selection */}
                {storages.length > 0 && (
                  <div>
                    <Text className="!text-white !text-base !font-semibold !block mb-3">
                      Storage:{" "}
                      <span className="text-apple-blue">
                        {selectedVariant?.storage || "Select"}
                      </span>
                    </Text>
                    <div className="flex flex-wrap gap-3">
                      {storages.map((storage) => {
                        const available = isStorageAvailable(storage);
                        const isSelected = selectedVariant?.storage === storage;

                        return (
                          <Button
                            key={storage}
                            size="large"
                            type={isSelected ? "primary" : "default"}
                            disabled={!available}
                            onClick={() => {
                              const variant = getVariantByOptions(
                                selectedVariant?.color || colors[0],
                                storage
                              );
                              if (variant) setSelectedVariant(variant);
                            }}
                            className={`!px-6 !rounded-xl transition-all duration-300 ${
                              isSelected
                                ? "!bg-apple-blue !border-apple-blue !text-white shadow-lg shadow-apple-blue/50"
                                : available
                                ? "glass !border-white/20 !text-white hover:!border-apple-blue/50"
                                : "!bg-gray-900 !border-gray-800 !text-gray-600 opacity-40 cursor-not-allowed"
                            }`}
                          >
                            {storage}
                            {!available && <span className="ml-2">✕</span>}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                {selectedVariant && (
                  <div className="flex items-center gap-2">
                    {selectedVariant.stock > 0 ? (
                      <>
                        <CheckCircleOutlined className="text-green-500" />
                        <Text className="!text-green-500">
                          In Stock ({selectedVariant.stock} available)
                        </Text>
                      </>
                    ) : (
                      <Text className="!text-red-500">Out of Stock</Text>
                    )}
                  </div>
                )}

                <Divider className="!bg-dark-border" />

                {/* Quantity & Add to Cart */}
                <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Text className="!text-white !text-sm !font-medium !block mb-2">
                        Quantity
                      </Text>
                      <InputNumber
                        min={1}
                        max={selectedVariant?.stock || 1}
                        value={quantity}
                        onChange={setQuantity}
                        size="large"
                        className="!w-full !h-12"
                      />
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined className="text-lg" />}
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                      className="!flex-[2] !h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none shadow-lg shadow-apple-blue/50 hover:shadow-apple-blue/70 transition-all duration-300"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>

                {/* Specifications */}
                {product.specifications &&
                  Object.keys(product.specifications).length > 0 && (
                    <div className="glass rounded-3xl p-6 border border-white/10">
                      <Text className="!text-white !text-lg !font-bold !block mb-4">
                        Technical Specifications
                      </Text>
                      <div className="space-y-3">
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between py-2 border-b border-white/5 last:border-0"
                            >
                              <Text className="!text-gray-400">{key}</Text>
                              <Text className="!text-white !font-medium">
                                {value}
                              </Text>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </PageLayout>
  );
}
