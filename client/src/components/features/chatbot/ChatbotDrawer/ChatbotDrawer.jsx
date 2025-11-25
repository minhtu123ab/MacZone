import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Button,
  Typography,
  Spin,
  Input,
  Card,
  Tag,
  Space,
  Empty,
  Badge,
  Tabs,
  message as antdMessage,
  Modal,
} from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  UserOutlined,
  HistoryOutlined,
  CommentOutlined,
  EyeOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../../../store/useChatbotStore";
import useCartStore from "../../../../store/useCartStore";
import useSupportChatStore from "../../../../store/useSupportChatStore";
import { chatbotAPI } from "../../../../services/api";
import { initSocket } from "../../../../services/socket";
import SupportChatTab from "../SupportChatTab";

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function ChatbotDrawer() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [userInput, setUserInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const {
    drawerVisible,
    setDrawerVisible,
    loading,
    currentStep,
    messages,
    categories,
    priceRanges,
    recommendations,
    selectCategory,
    selectPriceRange,
    submitStory,
    startNewChat,
  } = useChatbotStore();

  const { addToCart } = useCartStore();

  const { initializeSocket, cleanupSocket, unreadCount: supportUnreadCount } =
    useSupportChatStore();

  // Initialize socket when drawer opens
  useEffect(() => {
    if (drawerVisible) {
      initSocket();
      initializeSocket();
    }

    return () => {
      if (!drawerVisible) {
        cleanupSocket();
      }
    };
  }, [drawerVisible]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClose = () => {
    setDrawerVisible(false);
  };

  const handleCategorySelect = async (category) => {
    await selectCategory(category);
  };

  const handlePriceRangeSelect = async (priceRange) => {
    await selectPriceRange(priceRange);
  };

  const handleSubmitStory = async () => {
    if (userInput.trim().length >= 10) {
      await submitStory(userInput.trim());
      setUserInput("");
    }
  };

  const handleAddToCart = (product, variantId) => {
    addToCart({
      product_id: product._id,
      variant_id: variantId,
      quantity: 1,
    });
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
    setDrawerVisible(false);
    setDetailModalVisible(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderMessage = (msg, index) => {
    const isBot = msg.type === "bot";

    return (
      <div
        key={index}
        className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}
      >
        <div
          className={`flex items-start gap-2 max-w-[80%] ${
            isBot ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isBot
                ? "bg-gradient-to-br from-purple-500 to-purple-600"
                : "bg-gradient-to-br from-blue-500 to-blue-600"
            }`}
          >
            {isBot ? (
              <RobotOutlined className="text-white text-sm" />
            ) : (
              <UserOutlined className="text-white text-sm" />
            )}
          </div>

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-3 ${
              isBot
                ? "bg-gray-100 text-gray-800"
                : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            }`}
          >
            {msg.isLoading ? (
              <div className="flex items-center gap-2">
                <Spin size="small" />
                <span className="text-gray-600">{msg.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )}

            {/* Render data (categories, price ranges, recommendations) */}
            {msg.data && !msg.isLoading && (
              <div className="mt-3">
                {msg.data.categories && (
                  <div className="grid grid-cols-2 gap-3">
                    {msg.data.categories.map((cat) => {
                      // Icon mapping for each category
                      const getIcon = (name) => {
                        const lowerName = name.toLowerCase();
                        if (lowerName.includes("iphone")) return "📱";
                        if (lowerName.includes("ipad")) return "📲";
                        if (lowerName.includes("mac")) return "💻";
                        if (lowerName.includes("watch")) return "⌚";
                        if (lowerName.includes("airpod")) return "🎧";
                        if (lowerName.includes("accessories")) return "🔌";
                        return "📦";
                      };

                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat)}
                          className="cursor-pointer group relative px-3 py-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200/60 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 h-[52px]"
                        >
                          <div className="flex items-center gap-2 text-gray-700 group-hover:text-blue-700">
                            <span className="text-xl flex-shrink-0">
                              {getIcon(cat.name)}
                            </span>
                            <span className="font-medium text-sm truncate">
                              {cat.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {msg.data.priceRanges && (
                  <div className="flex flex-col gap-2">
                    {msg.data.priceRanges.map((range) => {
                      // Icon based on price range
                      const getIcon = (id) => {
                        if (id === 1) return "💵";
                        if (id === 2) return "💸";
                        if (id === 3) return "💰";
                        if (id === 4) return "💎";
                        if (id === 5) return "👑";
                        return "💵";
                      };

                      return (
                        <button
                          key={range.id}
                          onClick={() => handlePriceRangeSelect(range)}
                          className="cursor-pointer group w-full px-4 py-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200/60 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex items-center gap-2.5 text-gray-700 group-hover:text-emerald-700">
                            <span className="text-2xl">
                              {getIcon(range.id)}
                            </span>
                            <span className="font-semibold">{range.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {msg.data.recommendations && (
                  <div className="space-y-2 mt-2">
                    {msg.data.recommendations.map((rec, idx) => (
                      <Card
                        key={idx}
                        size="small"
                        className="bg-white hover:shadow-md transition-shadow"
                        styles={{ body: { padding: "12px" } }}
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <Badge
                              count={rec.rank}
                              style={{
                                backgroundColor:
                                  rec.rank === 1
                                    ? "#ffd700"
                                    : rec.rank === 2
                                    ? "#c0c0c0"
                                    : "#cd7f32",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            />
                            <img
                              src={
                                rec.product.thumbnail_url ||
                                "/placeholder-product.png"
                              }
                              alt={rec.product.name}
                              className="w-16 h-16 object-cover rounded mt-2"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1">
                              {rec.product.name}
                            </div>
                            <div className="text-purple-600 font-bold text-base mb-1">
                              {formatPrice(rec.product.price)}
                            </div>
                            <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {rec.reason}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="primary"
                                size="small"
                                icon={<ShoppingOutlined />}
                                onClick={() =>
                                  handleAddToCart(
                                    rec.product,
                                    rec.product.variantId
                                  )
                                }
                              >
                                Thêm
                              </Button>
                              <Button
                                type="default"
                                size="small"
                                onClick={() =>
                                  handleViewProduct(rec.product._id)
                                }
                              >
                                Chi tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Restart options */}
                {msg.data.showRestartOptions && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={() => startNewChat()}
                      className="flex-1"
                    >
                      Chat mới
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => setDrawerVisible(false)}
                      className="flex-1"
                    >
                      Đóng
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Fetch chat history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await chatbotAPI.getHistory({ limit: 20 });
      setChatHistory(response.data.data || []);
    } catch (error) {
      console.error("History error:", error);
      antdMessage.error("Không thể tải lịch sử chat");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === "history" && drawerVisible) {
      fetchHistory();
    }
  }, [activeTab, drawerVisible]);

  // Handle view history detail
  const handleViewHistoryDetail = (item) => {
    setSelectedHistory(item);
    setDetailModalVisible(true);
  };

  return (
    <>
      {/* History Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined />
            <span>Chi tiết cuộc trò chuyện</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedHistory && (
          <div className="space-y-4">
            {/* Info */}
            <Card size="small" className="bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">
                    Danh mục
                  </Text>
                  <div className="font-semibold">
                    {selectedHistory.category?.name}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">
                    Thời gian
                  </Text>
                  <div className="font-semibold">
                    {new Date(selectedHistory.createdAt).toLocaleString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">
                    Khoảng giá
                  </Text>
                  <div className="font-semibold">
                    {selectedHistory.priceRange
                      ? `${(selectedHistory.priceRange.min / 1000000).toFixed(
                          0
                        )}-${
                          selectedHistory.priceRange.max
                            ? (
                                selectedHistory.priceRange.max / 1000000
                              ).toFixed(0)
                            : "∞"
                        } triệu`
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">
                    Tokens sử dụng
                  </Text>
                  <div className="font-semibold">
                    {selectedHistory.tokensUsed || 0}
                  </div>
                </div>
              </div>
            </Card>

            {/* User Story */}
            <div>
              <Text strong className="block mb-2">
                Nhu cầu của bạn:
              </Text>
              <Card size="small" className="bg-blue-50">
                <Text>"{selectedHistory.userStory}"</Text>
              </Card>
            </div>

            {/* Recommendations */}
            <div>
              <Text strong className="block mb-2">
                Sản phẩm được đề xuất:
              </Text>
              <div className="space-y-2">
                {selectedHistory.recommendations?.map((rec, idx) => (
                  <Card
                    key={idx}
                    size="small"
                    hoverable
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleViewProduct(rec.product?._id)}
                  >
                    <div className="flex gap-3">
                      <Badge
                        count={rec.rank}
                        style={{
                          backgroundColor:
                            rec.rank === 1
                              ? "#ffd700"
                              : rec.rank === 2
                              ? "#c0c0c0"
                              : "#cd7f32",
                          color: "#000",
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          {rec.product?.name}
                        </div>
                        <div className="text-purple-600 font-bold mb-1">
                          {formatPrice(rec.product?.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {rec.reason}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Main Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <Space>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <RobotOutlined className="text-white text-lg" />
              </div>
              <div>
                <div className="font-bold text-lg">AI Shopping Assistant</div>
                <div className="text-xs text-gray-500 font-normal">
                  Powered by Gemini AI
                </div>
              </div>
            </Space>
          </div>
        }
        placement="right"
        width={480}
        onClose={handleClose}
        open={drawerVisible}
        closeIcon={<CloseOutlined />}
        footer={
          currentStep === "story" && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <TextArea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Nhập mô tả nhu cầu của bạn (ít nhất 10 ký tự)..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  disabled={loading}
                  onPressEnter={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      handleSubmitStory();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={loading}
                  onClick={handleSubmitStory}
                  disabled={!userInput.trim() || userInput.trim().length < 10}
                  className="self-end"
                >
                  Gửi
                </Button>
              </div>
              <Text type="secondary" className="text-xs block mt-2">
                Tip: Mô tả chi tiết nhu cầu sử dụng để nhận gợi ý tốt nhất
              </Text>
            </div>
          )
        }
        styles={{
          body: { padding: 0 },
        }}
      >
        <style>{`
        .chatbot-tabs {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .chatbot-tabs .ant-tabs-nav {
          width: 100%;
          margin-bottom: 0 !important;
          flex-shrink: 0;
        }
        .chatbot-tabs .ant-tabs-nav-list {
          width: 100%;
          display: flex;
        }
        .chatbot-tabs .ant-tabs-tab {
          flex: 1;
          display: flex;
          justify-content: center;
          margin: 0 !important;
        }
        .chatbot-tabs .ant-tabs-content-holder {
          padding: 0 !important;
          flex: 1;
          overflow: hidden;
        }
        .chatbot-tabs .ant-tabs-content {
          height: 100%;
        }
        .chatbot-tabs .ant-tabs-tabpane {
          height: 100%;
        }
      `}</style>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          className="chatbot-tabs"
          style={{ height: "100%" }}
          items={[
            {
              key: "chat",
              label: (
                <span className="text-sm">
                  <CommentOutlined /> Chat
                </span>
              ),
              children: (
                <div
                  className="overflow-y-auto bg-gradient-to-b from-purple-50/30 to-white"
                  style={{
                    height: "100%",
                  }}
                >
                  <div className="p-4">
                    {messages.length === 0 && !loading ? (
                      <div
                        className="flex flex-col items-center justify-center text-center"
                        style={{ minHeight: "calc(100vh - 250px)" }}
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                          <MessageOutlined className="text-white text-4xl" />
                        </div>
                        <Title level={4} className="mb-2">
                          Chào mừng đến với AI Assistant!
                        </Title>
                        <Text type="secondary">
                          Tôi sẽ giúp bạn tìm sản phẩm phù hợp nhất
                        </Text>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => renderMessage(msg, idx))}
                        <div ref={messagesEndRef} />
                      </>
                    )}

                    {loading && messages.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <Spin size="large">
                          <div className="text-gray-500 mt-2">
                            Đang kết nối với AI...
                          </div>
                        </Spin>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "support",
              label: (
                <Badge count={supportUnreadCount} offset={[10, 0]} size="small">
                  <span className="text-sm">
                    <CustomerServiceOutlined /> Hỗ trợ
                  </span>
                </Badge>
              ),
              children: <SupportChatTab />,
            },
            {
              key: "history",
              label: (
                <span className="text-sm">
                  <HistoryOutlined /> Lịch sử
                </span>
              ),
              children: (
                <div
                  className="bg-gray-50"
                  style={{
                    height: "100%",
                    overflowY: "auto",
                  }}
                >
                  <div className="p-4">
                    {historyLoading ? (
                      <div className="flex justify-center py-8">
                        <Spin size="large" />
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <Empty
                          description="Chưa có lịch sử chat"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatHistory.map((item) => (
                          <Card
                            key={item.id}
                            className="hover:shadow-lg transition-all cursor-pointer hover:border-purple-300"
                            styles={{ body: { padding: "16px" } }}
                            onClick={() => handleViewHistoryDetail(item)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Text strong className="text-base">
                                  {item.category?.name || "N/A"}
                                </Text>
                              </div>
                              <Button
                                type="link"
                                size="small"
                                icon={<EyeOutlined />}
                                className="!text-purple-600 hover:!text-purple-700"
                              >
                                Chi tiết
                              </Button>
                            </div>
                            <Text className="text-sm text-gray-600 block mb-3 line-clamp-2">
                              "{item.userStory}"
                            </Text>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2 flex-wrap">
                                <Tag color="purple">
                                  {item.recommendations?.length || 0} sản phẩm
                                </Tag>
                                {item.priceRange && (
                                  <Tag color="blue">
                                    {(item.priceRange.min / 1000000).toFixed(0)}
                                    -
                                    {item.priceRange.max
                                      ? (item.priceRange.max / 1000000).toFixed(
                                          0
                                        )
                                      : "∞"}{" "}
                                    triệu
                                  </Tag>
                                )}
                                {item.tokensUsed > 0 && (
                                  <Tag color="green">
                                    {item.tokensUsed} tokens
                                  </Tag>
                                )}
                              </div>
                              <Text type="secondary" className="text-xs">
                                {new Date(item.createdAt).toLocaleString(
                                  "vi-VN",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
