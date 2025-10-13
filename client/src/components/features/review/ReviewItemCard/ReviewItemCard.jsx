import { useState } from "react";
import {
  Card,
  Rate,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from "antd";
import { StarOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import useReviewStore from "../../../../store/useReviewStore";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ReviewItemCard({ item, review, onReviewChange }) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const { updateReview, deleteReview, createReview, loading } =
    useReviewStore();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    form.setFieldsValue({
      rating: review.rating,
      comment: review.comment,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      await updateReview(review._id, values);
      message.success("Review updated successfully!");
      setEditModalVisible(false);
      if (onReviewChange) onReviewChange();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update review");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(review._id);
      message.success("Review deleted successfully!");
      if (onReviewChange) onReviewChange();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const handleCreate = async (values) => {
    try {
      await createReview(item._id, values);
      message.success("Review submitted successfully!");
      createForm.resetFields();
      setShowCreateForm(false);
      if (onReviewChange) onReviewChange();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <>
      <Card
        className="border border-white/10 bg-white/5"
        bodyStyle={{ padding: "16px" }}
      >
        {/* Product Info */}
        <div className="flex gap-4 mb-4">
          {item.product?.thumbnail_url && (
            <img
              src={item.product.thumbnail_url}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <Text className="text-white font-medium block mb-1">
              {item.product?.name || item.product_name}
            </Text>
            <Text className="text-gray-400 text-sm block">
              {item.variant?.color || item.variant_color} -{" "}
              {item.variant?.storage || item.variant_storage}
            </Text>
          </div>
        </div>

        {/* Review Content */}
        {review ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rate
                  disabled
                  value={review.rating}
                  className="text-sm [&_.ant-rate-star-full]:!text-apple-blue [&_.ant-rate-star-half]:!text-apple-blue"
                />
                <Text className="text-gray-400 text-sm">
                  ({review.rating}/5)
                </Text>
              </div>
              <div className="flex gap-2">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  size="small"
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Review"
                  description="Are you sure you want to delete this review?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    size="small"
                    loading={loading}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </div>

            {review.comment && (
              <Paragraph className="text-gray-300 mb-2 bg-black/20 p-3 rounded-lg">
                "{review.comment}"
              </Paragraph>
            )}

            <Text className="text-gray-500 text-xs">
              Reviewed on {formatDate(review.createdAt)}
              {review.updatedAt !== review.createdAt && " (edited)"}
            </Text>
          </div>
        ) : !showCreateForm ? (
          <div className="text-center py-4">
            <StarOutlined className="text-gray-500 text-2xl mb-2" />
            <Text className="text-gray-400 block mb-3">No review yet</Text>
            <Button
              type="primary"
              icon={<StarOutlined />}
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:from-amber-600 hover:to-orange-600"
            >
              Write a Review
            </Button>
          </div>
        ) : (
          <Form form={createForm} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              label={<span className="text-white">Your Rating</span>}
              name="rating"
              rules={[{ required: true, message: "Please rate this product" }]}
            >
              <Rate
                className="[&_.ant-rate-star-full]:!text-apple-blue [&_.ant-rate-star-half]:!text-apple-blue [&_.ant-rate-star:not(.ant-rate-star-full)]:!text-gray-600"
                style={{ fontSize: "28px" }}
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

            <Form.Item className="mb-0">
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateForm(false)}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<StarOutlined />}
                  loading={loading}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:from-amber-600 hover:to-orange-600"
                >
                  Submit Review
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-500" />
            <span className="text-white">Edit Your Review</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        styles={{
          content: {
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.98))",
            padding: 0,
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 0,
            padding: "20px 24px",
          },
          body: {
            background: "transparent",
            padding: "24px",
          },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label={<span className="text-white">Rating</span>}
            name="rating"
            rules={[{ required: true, message: "Please rate this product" }]}
          >
            <Rate
              className="[&_.ant-rate-star-full]:!text-apple-blue [&_.ant-rate-star-half]:!text-apple-blue [&_.ant-rate-star:not(.ant-rate-star-full)]:!text-gray-600"
              style={{ fontSize: "32px" }}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-white">Review (Optional)</span>}
            name="comment"
          >
            <TextArea
              rows={4}
              placeholder="Share your experience with this product..."
              maxLength={1000}
              showCount
              styles={{
                textarea: {
                  background: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                },
                count: {
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
              className="placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Update Review
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
