import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Empty,
  Spin,
  Breadcrumb,
  Tabs,
  Pagination,
} from "antd";
import {
  ShoppingOutlined,
  HomeOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import OrderCard from "../components/common/OrderCard";
import useOrderStore from "../store/useOrderStore";
import useAuthStore from "../store/useAuthStore";
import { ROUTES } from "../constants";

const { Title, Text } = Typography;

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { orders, loading, pagination, fetchOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadOrders(activeTab, 1);
  }, [isAuthenticated, navigate]);

  const loadOrders = (status, page = 1) => {
    const params = {
      page,
      limit: 10,
      sort: "-createdAt",
    };

    if (status !== "all") {
      params.status = status;
    }

    fetchOrders(params);
    setCurrentPage(page);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    loadOrders(key, 1);
  };

  const handlePageChange = (page) => {
    loadOrders(activeTab, page);
  };

  const tabItems = [
    {
      key: "all",
      label: "All Orders",
    },
    {
      key: "pending",
      label: "Pending",
    },
    {
      key: "confirmed",
      label: "Confirmed",
    },
    {
      key: "shipping",
      label: "Shipping",
    },
    {
      key: "completed",
      label: "Completed",
    },
    {
      key: "canceled",
      label: "Canceled",
    },
  ];

  // Show full page loading only on first load
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (orders.length > 0 || !loading) {
      setIsFirstLoad(false);
    }
  }, [orders, loading]);

  if (isFirstLoad && loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Loading orders...">
            <div className="w-full h-32"></div>
          </Spin>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            className="mb-8"
            items={[
              {
                href: ROUTES.HOME,
                title: <HomeOutlined className="text-apple-blue" />,
              },
              {
                title: <span className="text-white">My Orders</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ShoppingOutlined className="text-apple-blue text-3xl" />
              <Title level={2} className="!text-white !mb-0">
                My Orders
              </Title>
              {pagination.total > 0 && (
                <span className="px-3 py-1 rounded-full bg-apple-blue text-white text-sm font-semibold">
                  {pagination.total} order(s)
                </span>
              )}
            </div>
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="!bg-apple-blue hover:!bg-apple-blue-light !border-none"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Tabs Filter */}
          <div className="glass rounded-2xl border border-white/10 mb-8 order-tabs-wrapper">
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              className="order-tabs"
            />
          </div>

          {/* Orders List */}
          <div className="min-h-[400px]">
            {loading && orders.length === 0 ? (
              <div className="flex justify-center items-center h-96">
                <Spin size="large" />
              </div>
            ) : orders.length === 0 ? (
              <div className="glass rounded-3xl p-16 border border-white/10">
                <Empty
                  image={<InboxOutlined className="text-8xl text-apple-gray" />}
                  description={
                    <div className="space-y-2 mt-8">
                      <Title level={3} className="!text-white">
                        No orders found
                      </Title>
                      <Text className="!text-apple-gray !text-base">
                        {activeTab === "all"
                          ? "You haven't placed any orders yet"
                          : `No ${activeTab} orders found`}
                      </Text>
                    </div>
                  }
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingOutlined />}
                    onClick={() => navigate(ROUTES.PRODUCTS)}
                    className="!mt-6 !h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none shadow-lg shadow-apple-blue/50"
                  >
                    Start Shopping
                  </Button>
                </Empty>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-8 relative">
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                      <Spin size="large" />
                    </div>
                  )}
                  {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      current={currentPage}
                      total={pagination.total}
                      pageSize={pagination.limit}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showTotal={(total, range) => (
                        <Text className="!text-apple-gray">
                          {range[0]}-{range[1]} of {total} orders
                        </Text>
                      )}
                      className="order-pagination"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
