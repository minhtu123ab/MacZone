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
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

const { Option } = Select;

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    role: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearch,
        role: filters.role,
      };

      const response = await adminAPI.getAllUsers(params);
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch users");
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

  const handleSearch = (value) => {
    setSearchInput(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleRoleFilter = (value) => {
    setFilters((prev) => ({ ...prev, role: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.data.success) {
        message.success("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        const response = await adminAPI.updateUser(editingUser._id, values);
        if (response.data.success) {
          message.success("User updated successfully");
          setModalVisible(false);
          fetchUsers();
          form.resetFields();
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await adminAPI.updateUserRole(userId, { role: newRole });
      if (response.data.success) {
        message.success("User role updated successfully");
        fetchUsers();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select
          value={role}
          style={{ width: 100 }}
          onChange={(value) => handleChangeRole(record._id, value)}
          size="small"
        >
          <Option value="user">
            <Tag color="blue">User</Tag>
          </Option>
          <Option value="admin">
            <Tag color="red">Admin</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: "Orders",
      key: "orders",
      render: (_, record) => record.stats?.orderCount || 0,
    },
    {
      title: "Total Spent",
      key: "totalSpent",
      render: (_, record) => formatCurrency(record.stats?.totalSpent || 0),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="User Management"
        extra={
          <Space align="center">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Filter by role"
              style={{ width: 150 }}
              className="mb-4"
              onChange={handleRoleFilter}
              allowClear
            >
              <Option value="">All Roles</Option>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
