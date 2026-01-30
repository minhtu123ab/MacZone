import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Empty,
  Spin,
  InputNumber,
  Card,
  Divider,
  Breadcrumb,
  Popconfirm,
  Alert,
  Badge,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  HomeOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";
import { ROUTES } from "../constants";

const { Title, Text } = Typography;

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    cart,
    loading,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeCartItem(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    navigate(ROUTES.CHECKOUT);
  };

  if (loading && !cart) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Loading cart...">
            <div className="w-full h-32"></div>
          </Spin>
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
                title: <span className="text-white">Shopping Cart</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ShoppingCartOutlined className="text-apple-blue text-3xl" />
              <Title level={2} className="!text-white !mb-0">
                Shopping Cart
              </Title>
              {cart && cart.total_items > 0 && (
                <span className="px-3 py-1 rounded-full bg-apple-blue text-white text-sm font-semibold">
                  {cart.total_items} {cart.total_items === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            {cart && cart.items.length > 0 && (
              <Popconfirm
                title="Clear cart?"
                description="Are you sure you want to remove all items?"
                onConfirm={handleClearCart}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className="!border-red-500 !text-red-500 hover:!bg-red-500/10"
                >
                  Clear Cart
                </Button>
              </Popconfirm>
            )}
          </div>

          {!cart || cart.items.length === 0 ? (
            /* Empty Cart */
            <div className="glass rounded-3xl p-16 border border-white/10">
              <Empty
                image={
                  <ShoppingCartOutlined className="text-8xl text-apple-gray" />
                }
                description={
                  <div className="space-y-2 mt-8">
                    <Title level={3} className="!text-white">
                      Your cart is empty
                    </Title>
                    <Text className="!text-apple-gray !text-base">
                      Looks like you haven't added anything to your cart yet
                    </Text>
                  </div>
                }
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={() => navigate(ROUTES.PRODUCTS)}
                  className="!mt-6 !h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none shadow-lg shadow-apple-blue/50"
                >
                  Start Shopping
                </Button>
              </Empty>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <Card
                    key={item._id}
                    className="!bg-transparent !border-white/10 glass rounded-2xl"
                    styles={{ body: { padding: "1.5rem" } }}
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-transparent flex-shrink-0">
                        {item.product.thumbnail_url ||
                        item.variant.image_url ? (
                          <img
                            src={
                              item.variant.image_url ||
                              item.product.thumbnail_url
                            }
                            alt={item.product.name}
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                            onClick={() =>
                              navigate(ROUTES.PRODUCT_DETAIL(item.product._id))
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
                            📱
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Text
                              className="!text-white !text-lg !font-semibold !block hover:!text-apple-blue cursor-pointer"
                              onClick={() =>
                                navigate(
                                  ROUTES.PRODUCT_DETAIL(item.product._id)
                                )
                              }
                            >
                              {item.product.name}
                            </Text>
                            {item.product.category && (
                              <Text className="!text-apple-gray !text-sm !block mt-1">
                                {item.product.category.name}
                              </Text>
                            )}
                            <div className="flex gap-3 mt-2">
                              <span className="px-3 py-1 rounded-full glass border border-white/20 text-apple-blue text-xs">
                                {item.variant.color}
                              </span>
                              <span className="px-3 py-1 rounded-full glass border border-white/20 text-apple-blue text-xs">
                                {item.variant.storage}
                              </span>
                              {item.is_insufficient_stock && (
                                <Badge
                                  count={
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/90 text-white text-xs font-semibold">
                                      <WarningOutlined />
                                      Insufficient Stock
                                    </span>
                                  }
                                />
                              )}
                            </div>
                          </div>
                          <Popconfirm
                            title="Remove item?"
                            description="Are you sure you want to remove this item from cart?"
                            onConfirm={() => handleRemoveItem(item._id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              className="!text-red-500 hover:!bg-red-500/10"
                            />
                          </Popconfirm>
                        </div>

                        <Divider className="!bg-dark-border !my-4" />

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-end">
                          <div>
                            <Text className="!text-apple-gray !text-sm !block mb-2">
                              Quantity
                            </Text>
                            <InputNumber
                              min={1}
                              max={item.variant.stock}
                              value={item.quantity}
                              onChange={(value) =>
                                handleQuantityChange(item._id, value)
                              }
                              size="large"
                              className="!w-32"
                              status={item.is_insufficient_stock ? "error" : ""}
                            />
                            {item.is_insufficient_stock ? (
                              <Text className="!text-red-500 !text-xs !block mt-2 !font-semibold">
                                ⚠️ Only {item.variant.stock} available!
                              </Text>
                            ) : item.quantity >= item.variant.stock ? (
                              <Text className="!text-yellow-500 !text-xs !block mt-2">
                                Max stock: {item.variant.stock}
                              </Text>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <Text className="!text-apple-gray !text-sm !block">
                              {formatPrice(item.variant.price)} ×{" "}
                              {item.quantity}
                            </Text>
                            <Title
                              level={4}
                              className="!text-apple-blue !mb-0 !mt-2"
                            >
                              {formatPrice(item.subtotal)}
                            </Title>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-2xl p-6 border border-white/10 sticky top-24">
                  <Title level={4} className="!text-white !mb-6">
                    Order Summary
                  </Title>

                  {cart.has_insufficient_stock && (
                    <Alert
                      message="Insufficient Stock"
                      description="Some items in your cart exceed available stock. Please adjust quantities before checkout."
                      type="error"
                      showIcon
                      icon={<WarningOutlined />}
                      className="!mb-4 !bg-red-500/10 !border-red-500/50"
                    />
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Text className="!text-apple-gray">Subtotal</Text>
                      <Text className="!text-white !font-semibold">
                        {formatPrice(cart.total_price)}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="!text-apple-gray">Shipping</Text>
                      <Text className="!text-white !font-semibold">Free</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="!text-apple-gray">Tax</Text>
                      <Text className="!text-white !font-semibold">
                        Included
                      </Text>
                    </div>

                    <Divider className="!bg-dark-border" />

                    <div className="flex justify-between items-center">
                      <Text className="!text-white !text-lg !font-bold">
                        Total
                      </Text>
                      <Title level={3} className="!text-apple-blue !mb-0">
                        {formatPrice(cart.total_price)}
                      </Title>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CreditCardOutlined />}
                      onClick={handleCheckout}
                      disabled={cart.has_insufficient_stock}
                      className="!mt-6 !h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none shadow-lg shadow-apple-blue/50 disabled:!bg-gray-600 disabled:!opacity-50 disabled:!cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </Button>

                    <Button
                      size="large"
                      block
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate(ROUTES.PRODUCTS)}
                      className="!h-12 !border-apple-blue !text-apple-blue-light hover:!bg-apple-blue/10"
                    >
                      Continue Shopping
                    </Button>
                  </div>

                  {/* Policies */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <Text className="!text-apple-gray !text-xs">
                          Free shipping on all orders
                        </Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <Text className="!text-apple-gray !text-xs">
                          30-day return policy
                        </Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <Text className="!text-apple-gray !text-xs">
                          Secure payment processing
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
