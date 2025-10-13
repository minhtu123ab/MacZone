import { useEffect, useMemo } from "react";
import { Drawer, Button, Typography, Empty, Spin, Tag, Card } from "antd";
import {
  StarOutlined,
  CloseOutlined,
  ShoppingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import useReviewStore from "../../../../store/useReviewStore";
import useOrderStore from "../../../../store/useOrderStore";

const { Text, Title } = Typography;

export default function ReviewDrawer() {
  const {
    reviewableItems,
    reviewableCount,
    isDrawerOpen,
    closeDrawer,
    selectOrderForReview,
    fetchReviewableItems,
    markAsPrompted,
    loading,
  } = useReviewStore();

  const { orders, fetchOrders } = useOrderStore();

  // Fetch data when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      fetchReviewableItems();
      fetchOrders({ status: "completed" });
    }
  }, [isDrawerOpen]);

  // Group reviewable items by order
  const groupedByOrder = useMemo(() => {
    const grouped = {};

    reviewableItems.forEach((item) => {
      // Find the order this item belongs to
      const order = orders.find((o) =>
        o.items?.some((oi) => oi._id === item._id)
      );

      if (order) {
        if (!grouped[order._id]) {
          grouped[order._id] = {
            order,
            items: [],
          };
        }
        grouped[order._id].items.push(item);
      }
    });

    return Object.values(grouped);
  }, [reviewableItems, orders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleOrderClick = async (orderGroup) => {
    // Mark items as prompted
    const itemIds = orderGroup.items.map((item) => item._id);
    await markAsPrompted(itemIds);

    // Open order review modal
    selectOrderForReview(orderGroup);
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <StarOutlined className="text-amber-500 text-xl" />
          <span className="text-white">Pending Reviews</span>
          {reviewableCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs">
              {reviewableCount}
            </span>
          )}
        </div>
      }
      placement="right"
      open={isDrawerOpen}
      onClose={closeDrawer}
      width={500}
      closeIcon={<CloseOutlined className="text-white hover:text-amber-500" />}
      className="review-drawer"
      styles={{
        header: {
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
        body: {
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
          padding: "16px",
        },
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : groupedByOrder.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <Text className="text-gray-400 text-base block mb-2">
                  No products to review
                </Text>
                <Text className="text-gray-500 text-sm">
                  Complete an order to leave reviews
                </Text>
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-4">
            <Text className="text-gray-300 text-sm">
              You have {reviewableCount} product{reviewableCount > 1 ? "s" : ""}{" "}
              waiting for your review across {groupedByOrder.length} order
              {groupedByOrder.length > 1 ? "s" : ""}
            </Text>
          </div>

          {groupedByOrder.map((orderGroup) => (
            <Card
              key={orderGroup.order._id}
              className="border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleOrderClick(orderGroup)}
            >
              <div className="space-y-3">
                {/* Order info */}
                <div className="flex justify-between items-start">
                  <div>
                    <Text className="text-white font-medium block">
                      Order #{orderGroup.order._id.slice(-8).toUpperCase()}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarOutlined className="text-gray-400 text-xs" />
                      <Text className="text-gray-400 text-xs">
                        {formatDate(orderGroup.order.createdAt)}
                      </Text>
                    </div>
                  </div>
                  <Tag color="success">Completed</Tag>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {orderGroup.items.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"
                    >
                      {item.product?.thumbnail_url && (
                        <img
                          src={item.product.thumbnail_url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Text className="text-white text-sm block truncate">
                          {item.product.name}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {item.variant.color} - {item.variant.storage}
                        </Text>
                      </div>
                    </div>
                  ))}

                  {orderGroup.items.length > 2 && (
                    <Text className="text-amber-500 text-xs">
                      +{orderGroup.items.length - 2} more product
                      {orderGroup.items.length - 2 > 1 ? "s" : ""}
                    </Text>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <Text className="text-gray-400 text-sm">
                    {orderGroup.items.length} product
                    {orderGroup.items.length > 1 ? "s" : ""} to review
                  </Text>
                  <Text className="text-white font-semibold">
                    {formatPrice(orderGroup.order.total_price)}
                  </Text>
                </div>

                {/* Review button */}
                <Button
                  type="primary"
                  icon={<StarOutlined />}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:from-amber-600 hover:to-orange-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrderClick(orderGroup);
                  }}
                >
                  Write Reviews
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Drawer>
  );
}
