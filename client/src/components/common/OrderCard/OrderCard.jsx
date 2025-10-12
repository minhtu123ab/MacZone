import { Card, Typography, Button, Divider } from "antd";
import { EyeOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import OrderStatusBadge from "../OrderStatusBadge";
import PaymentStatusBadge from "../PaymentStatusBadge";
import { ROUTES } from "../../../constants";

const { Text, Title } = Typography;

export default function OrderCard({ order }) {
  const navigate = useNavigate();

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

  return (
    <Card
      className="!bg-transparent !border-white/10 glass rounded-2xl hover:!border-apple-blue/50 transition-all duration-300"
      styles={{ body: { padding: "1.5rem" } }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <Text className="!text-apple-gray !text-sm">Order ID</Text>
          <Title level={5} className="!text-white !mb-1">
            #{order._id.slice(-8).toUpperCase()}
          </Title>
          <Text className="!text-apple-gray !text-xs">
            {formatDate(order.createdAt)}
          </Text>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <Divider className="!bg-dark-border !my-4" />

      {/* Order Items Preview */}
      <div className="space-y-3 mb-4">
        {order.items?.slice(0, 2).map((item) => (
          <div key={item._id} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/30 to-transparent flex-shrink-0">
              {item.product?.thumbnail_url || item.variant?.image_url ? (
                <img
                  src={item.variant?.image_url || item.product?.thumbnail_url}
                  alt={item.product?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                  📱
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Text className="!text-white !text-sm !font-medium !block truncate">
                {item.product?.name}
              </Text>
              <Text className="!text-apple-gray !text-xs">
                {item.variant?.color} - {item.variant?.storage} ×{" "}
                {item.quantity}
              </Text>
            </div>
            <Text className="!text-apple-blue !font-semibold">
              {formatPrice(item.subtotal)}
            </Text>
          </div>
        ))}
        {order.items?.length > 2 && (
          <Text className="!text-apple-gray !text-xs !block">
            +{order.items.length - 2} more item(s)
          </Text>
        )}
      </div>

      <Divider className="!bg-dark-border !my-4" />

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div>
          <Text className="!text-apple-gray !text-sm !block">Total Amount</Text>
          <Title level={4} className="!text-apple-blue !mb-0">
            {formatPrice(order.total_price)}
          </Title>
        </div>
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(ROUTES.ORDER_DETAIL(order._id))}
          className="!bg-apple-blue hover:!bg-apple-blue-light !border-none"
        >
          View Details
        </Button>
      </div>

      {/* Tracking Code */}
      {order.tracking_code && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <Text className="!text-apple-gray !text-xs">Tracking Code: </Text>
          <Text className="!text-apple-blue !text-sm !font-mono">
            {order.tracking_code}
          </Text>
        </div>
      )}
    </Card>
  );
}
