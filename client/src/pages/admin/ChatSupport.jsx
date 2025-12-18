import { useEffect, useState, useRef } from "react";
import {
  Card,
  Input,
  Select,
  List,
  Avatar,
  Badge,
  Button,
  Empty,
  Spin,
  Typography,
  Tag,
  Space,
  message as antdMessage,
} from "antd";
import {
  CustomerServiceOutlined,
  SearchOutlined,
  SendOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import useChatSupportStore from "../../store/useChatSupportStore";

const { Text } = Typography;
const { TextArea } = Input;

export default function ChatSupport() {
  const messagesEndRef = useRef(null);
  const messageInput = useRef(null);
  const [input, setInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    rooms,
    selectedRoom,
    messages,
    loading,
    sending,
    typing,
    totalUnread,
    stats,
    initializeSocket,
    cleanupSocket,
    fetchRooms,
    selectRoom,
    sendMessage,
    closeRoom,
    reopenRoom,
    fetchStats,
  } = useChatSupportStore();

  useEffect(() => {
    initializeSocket();
    fetchRooms();
    fetchStats();
    return () => {
      cleanupSocket();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms({ status: statusFilter, search: searchText });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, statusFilter]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    await sendMessage(text);
    messageInput.current?.focus();
  };

  const handleCloseRoom = async () => {
    if (!selectedRoom) return;
    const success = await closeRoom(selectedRoom._id);
    if (success) {
      antdMessage.success("Đã đóng cuộc trò chuyện");
    } else {
      antdMessage.error("Không thể đóng cuộc trò chuyện");
    }
  };

  const handleReopenRoom = async () => {
    if (!selectedRoom) return;
    const success = await reopenRoom(selectedRoom._id);
    if (success) {
      antdMessage.success("Đã mở lại cuộc trò chuyện");
    } else {
      antdMessage.error("Không thể mở lại cuộc trò chuyện");
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    if (now - d < 60000) return "Vừa xong";
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("vi-VN");
  };

  const renderMessage = (msg) => {
    const isAdmin = msg.role === "admin";
    return (
      <div key={msg._id} className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`flex items-end gap-2 max-w-[75%] ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
          <Avatar
            size={28}
            style={{ backgroundColor: isAdmin ? "#1890ff" : "#52c41a", flexShrink: 0 }}
            icon={isAdmin ? <CustomerServiceOutlined /> : <UserOutlined />}
          />
          <div>
            <div className={`rounded-2xl px-4 py-2.5 ${isAdmin ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isAdmin ? "justify-end" : ""}`}>
              <span>{formatTime(msg.createdAt)}</span>
              {isAdmin && msg.is_read && <CheckOutlined className="text-blue-500" />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card size="small"><div className="text-center"><div className="text-2xl font-bold text-blue-600">{stats.activeRooms}</div><div className="text-sm text-gray-600">Đang hoạt động</div></div></Card>
          <Card size="small"><div className="text-center"><div className="text-2xl font-bold text-orange-600">{stats.totalUnread}</div><div className="text-sm text-gray-600">Chưa đọc</div></div></Card>
          <Card size="small"><div className="text-center"><div className="text-2xl font-bold text-green-600">{stats.messagesToday}</div><div className="text-sm text-gray-600">Tin nhắn hôm nay</div></div></Card>
          <Card size="small"><div className="text-center"><div className="text-2xl font-bold text-purple-600">{stats.totalMessages}</div><div className="text-sm text-gray-600">Tổng tin nhắn</div></div></Card>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4" style={{ height: "calc(100vh - 250px)" }}>
        <Card className="col-span-4" title={<div className="flex items-center justify-between"><Space><CustomerServiceOutlined /><span>Cuộc trò chuyện</span>{totalUnread > 0 && <Badge count={totalUnread} />}</Space></div>} styles={{ body: { padding: 0, height: "100%" } }}>
          <div className="p-4 border-b">
            <Input placeholder="Tìm kiếm theo tên, email..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="mb-2" />
            <Select style={{ width: "100%" }} placeholder="Lọc theo trạng thái" value={statusFilter} onChange={setStatusFilter} allowClear>
              <Select.Option value="">Tất cả</Select.Option>
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="closed">Đã đóng</Select.Option>
            </Select>
          </div>
          <div style={{ height: "calc(100% - 120px)", overflowY: "auto" }}>
            {loading && rooms.length === 0 ? <div className="flex items-center justify-center h-full"><Spin /></div> : rooms.length === 0 ? <div className="flex items-center justify-center h-full"><Empty description="Chưa có cuộc trò chuyện nào" /></div> : (
              <List dataSource={rooms} renderItem={(room) => (
                <List.Item className={`cursor-pointer rounded-xl hover:bg-slate-800 transition-colors ${selectedRoom?._id === room._id ? "bg-slate-800" : ""}`} onClick={() => selectRoom(room._id)} style={{ padding: "12px 16px" }}>
                  <List.Item.Meta
                    avatar={<Badge count={room.unread_count_admin} offset={[-5, 5]} size="small"><Avatar style={{ backgroundColor: "#52c41a" }} icon={<UserOutlined />} /></Badge>}
                    title={<div className="flex items-center justify-between"><span className="font-semibold">{room.user_id?.full_name || "Unknown"}</span><Tag color={room.status === "active" ? "green" : "default"} style={{ fontSize: "10px" }}>{room.status === "active" ? "Hoạt động" : "Đã đóng"}</Tag></div>}
                    description={<div><div className="text-xs text-gray-600 truncate">{room.last_message || "Chưa có tin nhắn"}</div><div className="text-xs text-gray-400 mt-1">{room.last_message_at ? formatTime(room.last_message_at) : formatTime(room.createdAt)}</div></div>}
                  />
                </List.Item>
              )} />
            )}
          </div>
        </Card>

        <Card className="col-span-8" styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}>
          {selectedRoom ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <Space><Avatar style={{ backgroundColor: "#52c41a" }} icon={<UserOutlined />} /><div><div className="font-semibold">{selectedRoom.user_id?.full_name}</div><div className="text-xs text-gray-500">{selectedRoom.user_id?.email}</div></div></Space>
                  <Space>
                    {selectedRoom.status === "active" && <Button danger icon={<CloseCircleOutlined />} onClick={handleCloseRoom}>Đóng chat</Button>}
                    {selectedRoom.status === "closed" && <Button type="primary" onClick={handleReopenRoom}>Mở lại chat</Button>}
                  </Space>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white rounded-2xl">
                {loading && messages.length === 0 ? <div className="flex items-center justify-center h-full"><Spin size="large" tip="Đang tải..." /></div> : messages.length === 0 ? <div className="flex items-center justify-center h-full"><Empty description="Chưa có tin nhắn" /></div> : (
                  <div className="flex flex-col overflow-y-auto max-h-[70vh] p-4">
                    {messages.map((msg) => renderMessage(msg))}
                    {typing && (
                      <div className="flex items-center gap-2 mb-4">
                        <Avatar size={28} style={{ backgroundColor: "#52c41a" }} icon={<UserOutlined />} />
                        <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              {selectedRoom.status === "active" && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <TextArea ref={messageInput} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." autoSize={{ minRows: 1, maxRows: 4 }} disabled={sending} onPressEnter={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
                    <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={handleSend} disabled={!input.trim() || sending}>Gửi</Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Nhấn Enter để gửi, Shift+Enter để xuống dòng</div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full"><Empty description="Chọn một cuộc trò chuyện để bắt đầu" /></div>
          )}
        </Card>
      </div>
    </div>
  );
}
