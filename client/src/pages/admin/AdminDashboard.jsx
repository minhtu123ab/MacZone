import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Progress,
  message,
  Alert,
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  StarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, newThisMonth: 0, userGrowth: [] },
    products: { total: 0, active: 0, productsByCategory: [] },
    orders: {
      total: 0,
      statusBreakdown: {},
      revenue: 0,
      revenueGrowth: 0,
      revenueTrend: [],
      revenueByPaymentMethod: [],
      averageOrderValue: 0,
      conversionRate: 0,
      recentOrders: [],
    },
    reviews: {
      total: 0,
      newThisMonth: 0,
      averageRating: 0,
      ratingBreakdown: {},
    },
  });
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        ordersRes,
        usersRes,
        productsRes,
        reviewsRes,
        topProductsRes,
        lowStockRes,
      ] = await Promise.all([
        adminAPI.getOrderStats(),
        adminAPI.getUserStats(),
        adminAPI.getProductStats(),
        adminAPI.getReviewStats(),
        adminAPI.getTopSellingProducts({ limit: 10 }),
        adminAPI.getLowStockProducts({ threshold: 10 }),
      ]);

      if (ordersRes.data.success) {
        setStats((prev) => ({
          ...prev,
          orders: {
            total: ordersRes.data.data.totalOrders || 0,
            statusBreakdown: ordersRes.data.data.statusBreakdown || {},
            revenue: ordersRes.data.data.totalRevenue || 0,
            revenueGrowth: ordersRes.data.data.revenueGrowth || 0,
            revenueTrend: ordersRes.data.data.revenueTrend || [],
            revenueByPaymentMethod:
              ordersRes.data.data.revenueByPaymentMethod || [],
            averageOrderValue: ordersRes.data.data.averageOrderValue || 0,
            conversionRate: ordersRes.data.data.conversionRate || 0,
            recentOrders: ordersRes.data.data.recentOrders || [],
          },
        }));
      }

      if (usersRes.data.success) {
        setStats((prev) => ({
          ...prev,
          users: {
            total: usersRes.data.data.totalUsers || 0,
            newThisMonth: usersRes.data.data.newUsersThisMonth || 0,
            userGrowth: usersRes.data.data.userGrowth || [],
          },
        }));
        setTopCustomers(usersRes.data.data.topCustomers || []);
      }

      if (productsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          products: {
            total: productsRes.data.data.totalProducts || 0,
            active: productsRes.data.data.activeProducts || 0,
            productsByCategory: productsRes.data.data.productsByCategory || [],
          },
        }));
      }

      if (reviewsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          reviews: {
            total: reviewsRes.data.data.totalReviews || 0,
            newThisMonth: reviewsRes.data.data.newReviewsThisMonth || 0,
            averageRating: reviewsRes.data.data.averageRating || 0,
            ratingBreakdown: reviewsRes.data.data.ratingBreakdown || {},
          },
        }));
      }

      if (topProductsRes.data.success) {
        setTopProducts(topProductsRes.data.data || []);
      }

      if (lowStockRes.data.success) {
        setLowStockItems([
          ...(lowStockRes.data.data.lowStock || []),
          ...(lowStockRes.data.data.outOfStock || []),
        ]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Status colors
  const STATUS_COLORS = {
    pending: "#faad14", // Gold - Chờ xử lý
    confirmed: "#1890ff", // Blue - Đã xác nhận
    shipping: "#13c2c2", // Cyan - Đang giao hàng
    completed: "#52c41a", // Green - Hoàn thành
    canceled: "#f5222d", // Red - Đã hủy
  };

  // Format revenue trend data
  const revenueTrendData = stats.orders.revenueTrend.map((item) => ({
    date: `${item._id.day}/${item._id.month}`,
    revenue: item.revenue,
    orders: item.orderCount,
  }));

  // Format user growth data
  const userGrowthData = stats.users.userGrowth.map((item) => ({
    month: `${item._id.month}/${item._id.year}`,
    users: item.count,
  }));

  // Format order status data for pie chart
  const orderStatusData = Object.entries(stats.orders.statusBreakdown).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status],
    })
  );

  // Format rating breakdown for bar chart
  const ratingData = Object.entries(stats.reviews.ratingBreakdown).map(
    ([rating, count]) => ({
      rating: `${rating} ⭐`,
      count: count,
    })
  );

  // Format products by category for pie chart
  const categoryData = stats.products.productsByCategory.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  // Format payment method data
  const paymentMethodData = stats.orders.revenueByPaymentMethod.map((item) => ({
    method: item._id === "COD" ? "COD" : "Bank Transfer",
    revenue: item.revenue,
    orders: item.count,
  }));

  const customerColumns = [
    {
      title: "Customer",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orderCount",
    },
    {
      title: "Total Spent",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (amount) => formatCurrency(amount),
    },
  ];

  const recentOrderColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => `#${id.slice(-8)}`,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "Amount",
      dataIndex: "total_price",
      key: "total_price",
      render: (amount) => formatCurrency(amount),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  const topProductColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      width: "40%",
    },
    {
      title: "Sold",
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
      sorter: (a, b) => a.totalQuantitySold - b.totalQuantitySold,
    },
    {
      title: "Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orderCount",
    },
  ];

  const lowStockColumns = [
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "product",
    },
    {
      title: "Variant",
      key: "variant",
      render: (_, record) => (
        <Text>{`${record.variant.color} - ${record.variant.storage}`}</Text>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock, record) => (
        <Tag
          color={
            record.status === "out_of_stock"
              ? "red"
              : stock <= 5
              ? "orange"
              : "gold"
          }
          icon={
            record.status === "out_of_stock" ? (
              <WarningOutlined />
            ) : (
              <CheckCircleOutlined />
            )
          }
        >
          {stock === 0 ? "OUT OF STOCK" : `${stock} left`}
        </Tag>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Price",
      dataIndex: ["variant", "price"],
      key: "price",
      render: (price) => formatCurrency(price),
    },
  ];

  return (
    <div style={{ maxWidth: "100%", overflow: "hidden" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard Overview
      </Title>

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6} xl={5}>
          <Card bordered={false} hoverable style={{ height: "100%" }}>
            <Statistic
              title="Total Revenue"
              value={stats.orders.revenue}
              precision={0}
              valueStyle={{ color: "#3f8600", fontSize: 20 }}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
            <div style={{ marginTop: 8 }}>
              {stats.orders.revenueGrowth >= 0 ? (
                <span style={{ color: "#3f8600", fontSize: 12 }}>
                  <ArrowUpOutlined /> {stats.orders.revenueGrowth}%
                </span>
              ) : (
                <span style={{ color: "#cf1322", fontSize: 12 }}>
                  <ArrowDownOutlined /> {Math.abs(stats.orders.revenueGrowth)}%
                </span>
              )}
              <span style={{ marginLeft: 8, color: "#999", fontSize: 12 }}>
                vs last month
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6} xl={5}>
          <Card bordered={false} hoverable style={{ height: "100%" }}>
            <Statistic
              title="Total Orders"
              value={stats.orders.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 20 }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="gold">
                {stats.orders.statusBreakdown.pending || 0} Pending
              </Tag>
              <Tag color="green">
                {stats.orders.statusBreakdown.completed || 0} Completed
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6} xl={5}>
          <Card bordered={false} hoverable style={{ height: "100%" }}>
            <Statistic
              title="Total Users"
              value={stats.users.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1", fontSize: 20 }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">{stats.users.newThisMonth} New this month</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6} xl={5}>
          <Card bordered={false} hoverable style={{ height: "100%" }}>
            <Statistic
              title="Total Products"
              value={stats.products.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: 20 }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={
                  stats.products.total
                    ? Math.round(
                        (stats.products.active / stats.products.total) * 100
                      )
                    : 0
                }
                size="small"
                status="active"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6} xl={4}>
          <Card bordered={false} hoverable style={{ height: "100%" }}>
            <Statistic
              title="Total Reviews"
              value={stats.reviews.total}
              prefix={<StarOutlined />}
              valueStyle={{ color: "#eb2f96", fontSize: 20 }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="gold">
                ⭐ {stats.reviews.averageRating.toFixed(1)} Rating
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ height: "100%" }}>
            <Statistic
              title="Average Order Value"
              value={stats.orders.averageOrderValue}
              precision={0}
              suffix="VND"
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ height: "100%" }}>
            <Statistic
              title="Conversion Rate"
              value={stats.orders.conversionRate}
              precision={1}
              suffix="%"
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ height: "100%" }}>
            <Statistic
              title="New Reviews This Month"
              value={stats.reviews.newThisMonth}
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert
          message={`${lowStockItems.length} products are low on stock or out of stock`}
          description="Please restock these items soon to avoid losing sales"
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
          action={
            <a
              onClick={() => navigate("/admin/products")}
              style={{ textDecoration: "underline" }}
            >
              View Products
            </a>
          }
        />
      )}

      {/* Revenue Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Revenue Trend (Last 30 Days)"
            bordered={false}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [formatCurrency(value), "Revenue"]
                      : [value, "Orders"]
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Order Status Breakdown"
            bordered={false}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="40%"
                  labelLine={true}
                  label={({ value, percent }) =>
                    value > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  outerRadius={85}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} orders`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={50}
                  formatter={(value) => value}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "13px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="User Growth (Last 6 Months)"
            bordered={false}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#722ed1"
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Products by Category" bordered={false} loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Rating Distribution" bordered={false} loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#faad14" name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Revenue by Payment Method"
            bordered={false}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [formatCurrency(value), "Revenue"]
                      : [value, "Orders"]
                  }
                />
                <Legend />
                <Bar dataKey="revenue" fill="#52c41a" name="Revenue" />
                <Bar dataKey="orders" fill="#1890ff" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tables Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={12}>
          <Card
            title="Top Selling Products"
            bordered={false}
            extra={
              <a
                onClick={() => navigate("/admin/products")}
                style={{ cursor: "pointer" }}
              >
                View All
              </a>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                columns={topProductColumns}
                dataSource={topProducts}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title={
              <span>
                <WarningOutlined style={{ color: "#faad14" }} /> Low Stock Alert
              </span>
            }
            bordered={false}
            extra={
              <a
                onClick={() => navigate("/admin/products")}
                style={{ cursor: "pointer" }}
              >
                Manage Stock
              </a>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                columns={lowStockColumns}
                dataSource={lowStockItems}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title="Recent Orders"
            bordered={false}
            extra={
              <a
                onClick={() => navigate("/admin/orders")}
                style={{ cursor: "pointer" }}
              >
                View All
              </a>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                columns={recentOrderColumns}
                dataSource={stats.orders.recentOrders}
                loading={loading}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title="Top Customers"
            bordered={false}
            extra={
              <a
                onClick={() => navigate("/admin/users")}
                style={{ cursor: "pointer" }}
              >
                View All
              </a>
            }
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                columns={customerColumns}
                dataSource={topCustomers}
                loading={loading}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
