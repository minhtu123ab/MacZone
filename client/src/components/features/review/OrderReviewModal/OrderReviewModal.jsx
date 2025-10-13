import {
  Modal,
  Form,
  Rate,
  Input,
  Button,
  message,
  Card,
  Typography,
  Divider,
} from "antd";
import { StarOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import useReviewStore from "../../../../store/useReviewStore";

const { TextArea } = Input;
const { Text } = Typography;

// Component riêng cho mỗi item để mỗi item có form riêng
function ReviewItemForm({ item, onSuccess }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { createReview } = useReviewStore();

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await createReview(item._id, values);
      message.success("Review submitted successfully!");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-white/10 bg-white/5">
      {/* Product Info */}
      <div className="flex gap-4 mb-4">
        {item.product?.thumbnail_url && (
          <img
            src={item.product.thumbnail_url}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <Text className="text-white font-medium block mb-1">
            {item.product.name}
          </Text>
          <Text className="text-gray-400 text-sm block">
            {item.variant.color} - {item.variant.storage}
          </Text>
        </div>
      </div>

      <Divider className="bg-white/10 my-3" />

      {/* Review Form */}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={<span className="text-white">Your Rating</span>}
          name="rating"
          rules={[{ required: true, message: "Please rate this product" }]}
        >
          <Rate
            className="[&_.ant-rate-star-full]:!text-apple-blue [&_.ant-rate-star-half]:!text-apple-blue [&_.ant-rate-star:not(.ant-rate-star-full)]:!text-gray-600"
            style={{ fontSize: "32px" }}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-white">Your Review (Optional)</span>}
          name="comment"
        >
          <TextArea
            rows={4}
            placeholder="Share your experience with this product..."
            maxLength={1000}
            showCount
            className="bg-white/5 border-white/10 text-white placeholder-gray-500"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<StarOutlined />}
            loading={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:from-amber-600 hover:to-orange-600"
          >
            Submit Review
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default function OrderReviewModal() {
  const { selectedOrderForReview, clearSelectedOrder } = useReviewStore();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!selectedOrderForReview) return null;

  const { order, items } = selectedOrderForReview;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <StarOutlined className="text-amber-500 text-xl" />
          <div>
            <div className="text-white">Write Your Reviews</div>
            <Text className="text-gray-400 text-xs">
              Order #{order._id.slice(-8).toUpperCase()} -{" "}
              {formatDate(order.createdAt)}
            </Text>
          </div>
        </div>
      }
      open={!!selectedOrderForReview}
      onCancel={clearSelectedOrder}
      footer={null}
      width={700}
      centered
      closeIcon={<CloseOutlined className="text-white hover:text-amber-500" />}
      className="review-modal"
      styles={{
        header: {
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
        body: {
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
        },
      }}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item, index) => (
          <div key={item._id}>
            <ReviewItemForm item={item} />
            {index < items.length - 1 && (
              <Divider className="bg-white/10 my-4" />
            )}
          </div>
        ))}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.7);
        }
      `}</style>
    </Modal>
  );
}
