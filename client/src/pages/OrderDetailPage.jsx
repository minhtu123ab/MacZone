import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Divider,
  Breadcrumb,
  Spin,
  Modal,
  Input,
  Steps,
  Timeline,
  Alert,
} from "antd";
import {
  ShoppingOutlined,
  HomeOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import OrderStatusBadge from "../components/common/OrderStatusBadge";
import PaymentStatusBadge from "../components/common/PaymentStatusBadge";
import useOrderStore from "../store/useOrderStore";
import useAuthStore from "../store/useAuthStore";
import { ROUTES } from "../constants";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { currentOrder, loading, fetchOrderById, cancelOrder } =
    useOrderStore();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);

  const fromCheckout = location.state?.fromCheckout;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [isAuthenticated, orderId, navigate, fetchOrderById]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      return;
    }
    setCanceling(true);
    try {
      await cancelOrder(orderId, cancelReason);
      setCancelModalVisible(false);
      setCancelReason("");
      // Refresh order data
      await fetchOrderById(orderId);
    } catch (error) {
      console.error("Cancel order error:", error);
    } finally {
      setCanceling(false);
    }
  };

  const getOrderStatusStep = (status) => {
    const statusMap = {
      pending: 0,
      confirmed: 1,
      shipping: 2,
      completed: 3,
      canceled: -1,
    };
    return statusMap[status] || 0;
  };

  if (loading || !currentOrder) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Loading order details...">
            <div className="w-full h-32"></div>
          </Spin>
        </div>
      </PageLayout>
    );
  }

  const { order, items } = currentOrder;
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Alert for New Orders */}
          {fromCheckout && (
            <Alert
              message="Order Placed Successfully!"
              description="Thank you for your order. We'll send you updates about your order status."
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              closable
              className="mb-6 !bg-green-500/10 !border-green-500 glass"
            />
          )}

          {/* Breadcrumb */}
          <Breadcrumb
            className="mb-8"
            items={[
              {
                href: ROUTES.HOME,
                title: <HomeOutlined className="text-apple-blue" />,
              },
              {
                href: ROUTES.ORDERS,
                title: <span className="text-apple-gray">Orders</span>,
              },
              {
                title: <span className="text-white">Order Details</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ShoppingOutlined className="text-apple-blue text-3xl" />
              <div>
                <Title level={2} className="!text-white !mb-0">
                  Order #{order._id.slice(-8).toUpperCase()}
                </Title>
                <Text className="!text-apple-gray">
                  Placed on {formatDate(order.createdAt)}
                </Text>
              </div>
            </div>
            {canCancel && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setCancelModalVisible(true)}
                className="!border-red-500 !text-red-500 hover:!bg-red-500/10"
              >
                Cancel Order
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <Card
                className="!bg-transparent !border-white/10 glass rounded-2xl"
                styles={{ body: { padding: "2rem" } }}
              >
                <Title level={4} className="!text-white !mb-6">
                  Order Status
                </Title>

                {order.status === "canceled" ? (
                  <Timeline
                    items={[
                      {
                        color: "red",
                        dot: <CloseCircleOutlined className="text-xl" />,
                        children: (
                          <div>
                            <Text className="!text-white !font-semibold !block">
                              Order Canceled
                            </Text>
                            <Text className="!text-apple-gray !text-sm">
                              {formatDate(order.canceled_at || order.updatedAt)}
                            </Text>
                            {order.canceled_reason && (
                              <Text className="!text-red-400 !text-sm !block !mt-2">
                                Reason: {order.canceled_reason}
                              </Text>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <Steps
                    current={getOrderStatusStep(order.status)}
                    items={[
                      {
                        title: <Text className="!text-white">Pending</Text>,
                        icon: <ClockCircleOutlined />,
                      },
                      {
                        title: <Text className="!text-white">Confirmed</Text>,
                        icon: <CheckCircleOutlined />,
                      },
                      {
                        title: <Text className="!text-white">Shipping</Text>,
                        icon: <ShoppingOutlined />,
                      },
                      {
                        title: <Text className="!text-white">Completed</Text>,
                        icon: <CheckCircleOutlined />,
                      },
                    ]}
                    className="order-steps"
                  />
                )}
              </Card>

              {/* Order Items */}
              <Card
                className="!bg-transparent !border-white/10 glass rounded-2xl"
                styles={{ body: { padding: "2rem" } }}
              >
                <Title level={4} className="!text-white !mb-6">
                  Order Items
                </Title>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item._id}>
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-transparent flex-shrink-0">
                          {item.product?.thumbnail_url ||
                          item.variant?.image_url ? (
                            <img
                              src={
                                item.variant?.image_url ||
                                item.product?.thumbnail_url
                              }
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                              📱
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Text className="!text-white !text-lg !font-semibold !block">
                            {item.product?.name}
                          </Text>
                          <Text className="!text-apple-gray !text-sm !block mt-1">
                            {item.product?.description}
                          </Text>
                          <div className="flex gap-3 mt-2">
                            <span className="px-3 py-1 rounded-full glass border border-white/20 text-apple-blue text-xs">
                              {item.variant?.color}
                            </span>
                            <span className="px-3 py-1 rounded-full glass border border-white/20 text-apple-blue text-xs">
                              {item.variant?.storage}
                            </span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          <Text className="!text-apple-gray !text-sm !block">
                            {formatPrice(item.price)} × {item.quantity}
                          </Text>
                          <Title
                            level={4}
                            className="!text-apple-blue !mb-0 !mt-2"
                          >
                            {formatPrice(item.subtotal)}
                          </Title>
                        </div>
                      </div>
                      <Divider className="!bg-dark-border !my-4" />
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4">
                    <Text className="!text-white !text-xl !font-bold">
                      Total Amount
                    </Text>
                    <Title level={2} className="!text-apple-blue !mb-0">
                      {formatPrice(order.total_price)}
                    </Title>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Details Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status Card */}
              <Card
                className="!bg-transparent !border-white/10 glass rounded-2xl"
                styles={{ body: { padding: "1.5rem" } }}
              >
                <div className="space-y-4">
                  <div>
                    <Text className="!text-apple-gray !text-sm !block mb-2">
                      Order Status
                    </Text>
                    <OrderStatusBadge status={order.status} size="large" />
                  </div>
                  <div>
                    <Text className="!text-apple-gray !text-sm !block mb-2">
                      Payment Status
                    </Text>
                    <PaymentStatusBadge
                      status={order.payment_status}
                      size="large"
                    />
                  </div>
                  <div>
                    <Text className="!text-apple-gray !text-sm !block mb-2">
                      Payment Method
                    </Text>
                    <Text className="!text-white !font-semibold !text-base">
                      {order.payment_method === "COD"
                        ? "Cash on Delivery"
                        : order.payment_method === "banking"
                        ? "Bank Transfer"
                        : "Credit Card"}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Shipping Information */}
              <Card
                className="!bg-transparent !border-white/10 glass rounded-2xl"
                styles={{ body: { padding: "1.5rem" } }}
              >
                <Title level={5} className="!text-white !mb-4">
                  Shipping Information
                </Title>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserOutlined className="text-apple-blue text-lg mt-1" />
                    <div>
                      <Text className="!text-apple-gray !text-xs !block">
                        Name
                      </Text>
                      <Text className="!text-white !font-medium">
                        {order.customer_name}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PhoneOutlined className="text-apple-blue text-lg mt-1" />
                    <div>
                      <Text className="!text-apple-gray !text-xs !block">
                        Phone
                      </Text>
                      <Text className="!text-white !font-medium">
                        {order.phone_number}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <EnvironmentOutlined className="text-apple-blue text-lg mt-1" />
                    <div>
                      <Text className="!text-apple-gray !text-xs !block">
                        Address
                      </Text>
                      <Text className="!text-white !font-medium">
                        {order.shipping_address}
                      </Text>
                    </div>
                  </div>
                  {order.note && (
                    <div className="flex items-start gap-3">
                      <FileTextOutlined className="text-apple-blue text-lg mt-1" />
                      <div>
                        <Text className="!text-apple-gray !text-xs !block">
                          Note
                        </Text>
                        <Text className="!text-white !font-medium">
                          {order.note}
                        </Text>
                      </div>
                    </div>
                  )}
                  {order.transfer_reference && (
                    <div className="flex items-start gap-3">
                      <CreditCardOutlined className="text-apple-blue text-lg mt-1" />
                      <div>
                        <Text className="!text-apple-gray !text-xs !block">
                          Transfer Reference
                        </Text>
                        <Text className="!text-apple-blue !font-mono !font-semibold !text-base">
                          {order.transfer_reference}
                        </Text>
                      </div>
                    </div>
                  )}
                  {order.tracking_code && (
                    <div className="flex items-start gap-3">
                      <CreditCardOutlined className="text-apple-blue text-lg mt-1" />
                      <div>
                        <Text className="!text-apple-gray !text-xs !block">
                          Tracking Code
                        </Text>
                        <Text className="!text-apple-blue !font-mono !font-semibold">
                          {order.tracking_code}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions */}
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
          </div>

          {/* Cancel Order Modal */}
          <Modal
            title={
              <div className="flex items-center gap-2">
                <CloseCircleOutlined className="text-red-500" />
                <span>Cancel Order</span>
              </div>
            }
            open={cancelModalVisible}
            onOk={handleCancelOrder}
            onCancel={() => {
              setCancelModalVisible(false);
              setCancelReason("");
            }}
            okText="Cancel Order"
            cancelText="Keep Order"
            okButtonProps={{
              danger: true,
              loading: canceling,
              disabled: !cancelReason.trim(),
            }}
            className="cancel-order-modal"
          >
            <div className="py-4">
              <Text className="!text-base !block !mb-4">
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </Text>
              <TextArea
                placeholder="Please provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                maxLength={500}
                showCount
                className="!bg-dark-bg !border-dark-border !text-white"
              />
            </div>
          </Modal>
        </div>
      </div>
    </PageLayout>
  );
}
