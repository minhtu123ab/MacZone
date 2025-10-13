import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Typography,
  Progress,
  message,
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";

const { Title } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, newThisMonth: 0 },
    products: { total: 0, active: 0 },
    orders: {
      total: 0,
      pending: 0,
      revenue: 0,
      revenueGrowth: 0,
    },
  });
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        adminAPI.getOrderStats(),
        adminAPI.getUserStats(),
        adminAPI.getProductStats(),
      ]);

      if (ordersRes.data.success) {
        setStats((prev) => ({
          ...prev,
          orders: {
            total: ordersRes.data.data.totalOrders || 0,
            pending: ordersRes.data.data.pendingOrders || 0,
            revenue: ordersRes.data.data.totalRevenue || 0,
            revenueGrowth: ordersRes.data.data.revenueGrowth || 0,
          },
        }));
      }

      if (usersRes.data.success) {
        setStats((prev) => ({
          ...prev,
          users: {
            total: usersRes.data.data.totalUsers || 0,
            newThisMonth: usersRes.data.data.newUsersThisMonth || 0,
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
          },
        }));
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

  return (
    <div style={{ maxWidth: "100%", overflow: "hidden" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard Overview
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
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

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total Orders"
              value={stats.orders.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 20 }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="gold">{stats.orders.pending} Pending</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
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

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
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
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
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
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
