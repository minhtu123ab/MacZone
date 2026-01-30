import { useEffect } from "react";
import {
  Drawer,
  Button,
  Typography,
  Empty,
  Spin,
  InputNumber,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  CloseOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../../../store/useCartStore";
import { ROUTES } from "../../../../constants";

const { Text, Title } = Typography;

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    drawerVisible,
    setDrawerVisible,
    updateCartItem,
    removeCartItem,
    fetchCart,
  } = useCartStore();

  // Fetch cart data when drawer opens
  useEffect(() => {
    if (drawerVisible) {
      fetchCart();
    }
  }, [drawerVisible, fetchCart]);

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

  const handleViewCart = () => {
    setDrawerVisible(false);
    navigate(ROUTES.CART);
  };

  const handleContinueShopping = () => {
    setDrawerVisible(false);
    navigate(ROUTES.PRODUCTS);
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-apple-blue text-xl" />
          <span className="text-white">Shopping Cart</span>
          {cart && cart.total_items > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-apple-blue text-white text-xs">
              {cart.total_items}
            </span>
          )}
        </div>
      }
      placement="right"
      open={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      width={450}
      closeIcon={<CloseOutlined className="text-white hover:text-apple-blue" />}
      className="cart-drawer"
      styles={{
        header: {
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
        body: {
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
          padding: 0,
        },
      }}
      footer={
        cart && cart.total_items > 0 ? (
          <div className="space-y-3 p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-black border-t border-white/10">
            <div className="flex justify-between items-center">
              <Text className="!text-apple-gray text-base">Total:</Text>
              <Title level={4} className="!text-apple-blue !mb-0">
                {formatPrice(cart.total_price)}
              </Title>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleViewCart}
              disabled={cart.has_insufficient_stock}
              className="!h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none shadow-lg shadow-apple-blue/50"
            >
              View Cart & Checkout
            </Button>
          </div>
        ) : null
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading cart...">
            <div className="w-full h-32"></div>
          </Spin>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-16 px-4">
          <Empty
            image={
              <ShoppingCartOutlined className="text-6xl text-apple-gray" />
            }
            description={
              <div className="space-y-2">
                <Text className="!text-white !text-base !block">
                  Your cart is empty
                </Text>
                <Text className="!text-apple-gray !text-sm !block">
                  Start shopping to add items to your cart
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={handleContinueShopping}
              className="!bg-apple-blue hover:!bg-apple-blue-light !border-none"
            >
              Continue Shopping
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="glass rounded-2xl p-4 border border-white/10 space-y-3"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-transparent flex-shrink-0">
                    {item.product.thumbnail_url || item.variant.image_url ? (
                      <img
                        src={
                          item.variant.image_url || item.product.thumbnail_url
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                        📱
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Text className="!text-white !text-sm !font-semibold !block truncate">
                      {item.product.name}
                    </Text>
                    <Text className="!text-apple-gray !text-xs !block">
                      {item.variant.color} - {item.variant.storage}
                    </Text>
                    <Text className="!text-apple-blue !text-sm !font-bold !block mt-1">
                      {formatPrice(item.variant.price)}
                    </Text>
                  </div>
                </div>

                {/* Quantity Controls and Remove Button */}
                <div className="flex items-center justify-between">
                  <InputNumber
                    min={1}
                    max={item.variant.stock}
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(item._id, value)}
                    size="small"
                    className="!w-24"
                  />
                  <div className="flex items-center gap-3">
                    <Text className="!text-white !text-sm !font-semibold">
                      {formatPrice(item.subtotal)}
                    </Text>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item._id)}
                      className="!text-red-500 hover:!bg-red-500/10"
                    />
                  </div>
                </div>

                {/* Stock Warning */}
                {item.quantity > item.variant.stock && (
                  <Text className="!text-red-500 !text-xs !block">
                    Maximum stock reached ({item.variant.stock} available)
                  </Text>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
