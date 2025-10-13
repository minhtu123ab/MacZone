import { useState, useEffect } from "react";
import {
  Card,
  Rate,
  Typography,
  Avatar,
  Empty,
  Spin,
  Pagination,
  Divider,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { reviewAPI } from "../../../../services/api";

const { Title, Text, Paragraph } = Typography;

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(productId, {
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.data.success) {
        setReviews(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, pagination.page]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    // Scroll to reviews section
    document.getElementById("reviews-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div id="reviews-section" className="mt-12">
      <div className="glass rounded-3xl p-8 border border-white/10">
        <Title level={3} className="!text-white !mb-6">
          Customer Reviews
          {pagination.total > 0 && (
            <span className="text-apple-gray text-lg ml-2">
              ({pagination.total})
            </span>
          )}
        </Title>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : reviews.length === 0 ? (
          <Empty
            description={
              <Text className="!text-gray-400">
                No reviews yet. Be the first to review this product!
              </Text>
            }
            className="py-12"
          />
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card
                key={review._id}
                className="!bg-gradient-to-br !from-gray-900/50 !to-gray-800/30 !border-white/10 hover:!border-apple-blue/30 transition-all duration-300"
                styles={{
                  body: { padding: "20px" },
                }}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    src={review.user_id?.avatar_url}
                    className="!bg-gradient-to-br !from-apple-blue !to-purple-600 flex-shrink-0"
                  />

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* User Info & Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <Text className="!text-white !font-semibold !text-base !mb-0">
                            {review.user_id?.full_name || "Anonymous User"}
                          </Text>

                          {/* Variant Info inline */}
                          {review.variant_id && (
                            <>
                              {review.variant_id.color && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/50"></div>
                                  <Text className="!text-blue-300 !text-xs !font-medium !mb-0">
                                    {review.variant_id.color}
                                  </Text>
                                </div>
                              )}
                              {review.variant_id.storage && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm">
                                  <svg
                                    className="w-3 h-3 text-amber-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                  </svg>
                                  <Text className="!text-amber-300 !text-xs !font-medium !mb-0">
                                    {review.variant_id.storage}
                                  </Text>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <Rate
                          disabled
                          value={review.rating}
                          className="!text-sm [&_.ant-rate-star-full]:!text-apple-blue [&_.ant-rate-star-half]:!text-apple-blue"
                        />
                      </div>
                      <Text className="!text-gray-400 !text-sm">
                        {formatDate(review.createdAt)}
                      </Text>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <Paragraph className="!text-gray-300 !mb-0 !mt-3">
                        {review.comment}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <>
                <Divider className="!bg-white/10 !my-6" />
                <div className="flex justify-center">
                  <Pagination
                    current={pagination.page}
                    total={pagination.total}
                    pageSize={pagination.limit}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="[&_.ant-pagination-item]:!bg-gray-800/50 [&_.ant-pagination-item]:!border-white/10 [&_.ant-pagination-item-active]:!bg-apple-blue [&_.ant-pagination-item-active]:!border-apple-blue [&_.ant-pagination-item>a]:!text-white"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
