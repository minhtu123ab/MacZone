import { useEffect, useRef, useState } from "react";
import {
  Spin,
  Input,
  Button,
  Empty,
  Badge,
  Avatar,
  message as antdMessage,
} from "antd";
import {
  SendOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import useSupportChatStore from "../../../../store/useSupportChatStore";

const { TextArea } = Input;

export default function SupportChatTab() {
  const messagesEndRef = useRef(null);
  const messageInput = useRef(null);
  const typingTimeout = useRef(null);

  const [input, setInput] = useState("");

  const {
    room,
    messages,
    loading,
    sending,
    typing,
    adminOnline,
    unreadCount,
    error,
    fetchRoom,
    fetchMessages,
    sendMessage,
    markAsRead,
    setTyping,
  } = useSupportChatStore();

  // Initialize room
  useEffect(() => {
    fetchRoom();

    // Mark messages as read when component mounts
    return () => {
      if (unreadCount > 0) {
        markAsRead();
      }
    };
  }, []);

  // Fetch messages when room is available
  useEffect(() => {
    if (room?._id) {
      fetchMessages();
      markAsRead();
    }
  }, [room]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && unreadCount > 0) {
      const timer = setTimeout(() => {
        markAsRead();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [messages, unreadCount]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput("");

    // Stop typing
    setTyping(false);

    await sendMessage(text);

    // Focus back on input
    messageInput.current?.focus();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Send typing indicator
    if (value.trim()) {
      setTyping(true);

      // Clear previous timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      // Stop typing after 2 seconds
      typingTimeout.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (msg) => {
    const isAdmin = msg.role === "admin";
    const isRead = msg.is_read;

    return (
      <div
        key={msg._id}
        className={`flex ${isAdmin ? "justify-start" : "justify-end"} mb-4`}
      >
        <div
          className={`flex items-end gap-2 max-w-[75%] ${
            isAdmin ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {/* Avatar */}
          <Avatar
            size={28}
            style={{
              backgroundColor: isAdmin ? "#52c41a" : "#1890ff",
              flexShrink: 0,
            }}
            icon={isAdmin ? <CustomerServiceOutlined /> : <UserOutlined />}
          />

          {/* Message bubble */}
          <div>
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                isAdmin
                  ? "bg-gray-100 text-gray-800"
                  : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
            </div>

            {/* Time and read status */}
            <div
              className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                isAdmin ? "" : "justify-end"
              }`}
            >
              <span>{formatTime(msg.createdAt)}</span>
              {!isAdmin && isRead && (
                <CheckOutlined className="text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ {error}</div>
          <Button onClick={() => fetchRoom()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              style={{ backgroundColor: "#52c41a" }}
              icon={<CustomerServiceOutlined />}
            />
            <div>
              <div className="font-semibold text-gray-800">Hỗ trợ khách hàng</div>
              <div className="text-xs">
                {adminOnline ? (
                  <Badge status="success" text="Đang hoạt động" />
                ) : (
                  <Badge status="default" text="Offline" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty
              description="Chưa có tin nhắn nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <p className="text-gray-500 text-sm mt-2">
                Gửi tin nhắn để bắt đầu trò chuyện với đội ngũ hỗ trợ
              </p>
            </Empty>
          </div>
        ) : (
          <>
            {messages.map((msg) => renderMessage(msg))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-center gap-2 mb-4">
                <Avatar
                  size={28}
                  style={{ backgroundColor: "#52c41a" }}
                  icon={<CustomerServiceOutlined />}
                />
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex gap-2">
          <TextArea
            ref={messageInput}
            value={input}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={sending}
            onPressEnter={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={sending}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="self-end"
          >
            Gửi
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </div>
      </div>
    </div>
  );
}
