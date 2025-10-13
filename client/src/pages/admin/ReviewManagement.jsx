import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Rate,
  Avatar,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  StarOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  StarFilled,
} from "@ant-design/icons";
import { adminAPI } from "../../services/api";

const { Option } = Select;

const ReviewManagement = () => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    rating: "",
  });

  useEffect(() => {
    fetchReviews();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        rating: filters.rating,
      };

      const response = await adminAPI.getAllReviews(params);
      if (response.data.success) {
        setReviews(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch reviews");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleDelete = async (reviewId) => {
    try {
      const response = await adminAPI.deleteReview(reviewId);
      if (response.data.success) {
        message.success("Review deleted successfully");
        fetchReviews();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      width: 220,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "220px",
          }}
        >
          <Avatar icon={<UserOutlined />} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.user_id?.full_name || "Unknown"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#999",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={record.user_id?.email}
            >
              {record.user_id?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <div>
          <div>{record.product_id?.name || "Unknown"}</div>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => (
        <div>
          <Rate
            disabled
            value={rating}
            style={{ fontSize: 14, color: "#3b82f6" }}
          />
        </div>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (comment) =>
        comment || <span style={{ color: "#999" }}>No comment</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this review?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Review Management"
        extra={
          <Space align="center">
            <Select
              placeholder="Filter by rating"
              style={{ width: 150 }}
              className="mb-4"
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, rating: value }))
              }
              allowClear
            >
              <Option value="">All Ratings</Option>
              <Option value="5">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#3b82f6",
                  }}
                >
                  <StarFilled /> 5 Stars
                </span>
              </Option>
              <Option value="4">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#3b82f6",
                  }}
                >
                  <StarFilled /> 4 Stars
                </span>
              </Option>
              <Option value="3">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#3b82f6",
                  }}
                >
                  <StarFilled /> 3 Stars
                </span>
              </Option>
              <Option value="2">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#3b82f6",
                  }}
                >
                  <StarFilled /> 2 Stars
                </span>
              </Option>
              <Option value="1">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#3b82f6",
                  }}
                >
                  <StarFilled /> 1 Star
                </span>
              </Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchReviews}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={reviews}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ReviewManagement;
