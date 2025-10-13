import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Form,
  Descriptions,
  Divider,
} from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/api";

const { Option } = Select;

const OrderManagement = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateForm] = Form.useForm();

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        payment_status: filters.payment_status,
      };

      const response = await adminAPI.getAllOrders(params);
      if (response.data.success) {
        setOrders(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch orders");
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

  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    updateForm.setFieldsValue({
      status: order.status,
      payment_status: order.payment_status,
      tracking_code: order.tracking_code,
    });
    setDetailModalVisible(true);
  };

  const handleUpdateOrder = async (values) => {
    try {
      // Update status
      if (values.status !== selectedOrder.status) {
        await adminAPI.updateOrderStatus(selectedOrder._id, {
          status: values.status,
        });
      }

      // Update payment status
      if (values.payment_status !== selectedOrder.payment_status) {
        await adminAPI.updatePaymentStatus(selectedOrder._id, {
          payment_status: values.payment_status,
        });
      }

      // Update tracking code
      if (
        values.tracking_code &&
        values.tracking_code !== selectedOrder.tracking_code
      ) {
        await adminAPI.updateTrackingCode(selectedOrder._id, {
          tracking_code: values.tracking_code,
        });
      }

      message.success("Order updated successfully");
      setDetailModalVisible(false);
      fetchOrders();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "gold",
      confirmed: "blue",
      shipping: "cyan",
      completed: "green",
      canceled: "red",
    };
    return colors[status] || "default";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: "red",
      paid: "green",
      refunded: "orange",
    };
    return colors[status] || "default";
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      width: 120,
      render: (id) => `#${id.slice(-8)}`,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "Email",
      key: "email",
      render: (_, record) => record.user?.email || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Items",
      dataIndex: "items_count",
      key: "items_count",
      align: "center",
    },
    {
      title: "Total",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        />
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Order Management"
        extra={
          <Space align="center">
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              className="mb-4"
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              allowClear
            >
              <Option value="">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="shipping">Shipping</Option>
              <Option value="completed">Completed</Option>
              <Option value="canceled">Canceled</Option>
            </Select>
            <Select
              placeholder="Payment status"
              style={{ width: 150 }}
              className="mb-4"
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, payment_status: value }))
              }
              allowClear
            >
              <Option value="">All Payment</Option>
              <Option value="unpaid">Unpaid</Option>
              <Option value="paid">Paid</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={`Order Details - #${selectedOrder?._id?.slice(-8)}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Customer">
                {selectedOrder.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.phone_number}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedOrder.payment_method}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {selectedOrder.shipping_address}
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Note" span={2}>
                  {selectedOrder.note}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Total">
                <strong style={{ fontSize: 16, color: "#1890ff" }}>
                  {formatCurrency(selectedOrder.total_price)}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Order Items</Divider>

            <Table
              size="small"
              dataSource={selectedOrder.items}
              pagination={false}
              rowKey="_id"
              columns={[
                {
                  title: "Product",
                  key: "product",
                  render: (_, item) => item.product.name,
                },
                {
                  title: "Variant",
                  key: "variant",
                  render: (_, item) =>
                    `${item.variant.color} - ${item.variant.storage}`,
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                  align: "center",
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  render: (price) => formatCurrency(price),
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  key: "subtotal",
                  render: (subtotal) => formatCurrency(subtotal),
                },
              ]}
            />

            <Divider>Update Order</Divider>

            <Form
              form={updateForm}
              layout="vertical"
              onFinish={handleUpdateOrder}
            >
              <Form.Item label="Order Status" name="status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="shipping">Shipping</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="canceled">Canceled</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Payment Status" name="payment_status">
                <Select>
                  <Option value="unpaid">Unpaid</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="refunded">Refunded</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Tracking Code" name="tracking_code">
                <Input placeholder="Enter tracking code" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Update Order
                  </Button>
                  <Button onClick={() => setDetailModalVisible(false)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
