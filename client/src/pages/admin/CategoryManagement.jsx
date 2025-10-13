import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  message,
  Form,
  Popconfirm,
  Tooltip,
  Image,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

const { TextArea } = Input;

const CategoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories when debouncedSearch changes
    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [debouncedSearch, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      message.error("Failed to fetch categories");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
    });
    setModalVisible(true);
  };

  const handleDelete = async (categoryId) => {
    try {
      const response = await adminAPI.deleteCategory(categoryId);
      if (response.data.success) {
        message.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        const response = await adminAPI.updateCategory(
          editingCategory._id,
          values
        );
        if (response.data.success) {
          message.success("Category updated successfully");
          setModalVisible(false);
          fetchCategories();
          form.resetFields();
        }
      } else {
        const response = await adminAPI.createCategory(values);
        if (response.data.success) {
          message.success("Category created successfully");
          setModalVisible(false);
          fetchCategories();
          form.resetFields();
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (url) => (
        <Image
          src={url || "https://via.placeholder.com/80"}
          alt="Category"
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
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
            title="Are you sure you want to delete this category?"
            description="This action cannot be undone."
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
        title="Category Management"
        extra={
          <Space align="center">
            <Input
              placeholder="Search categories..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={fetchCategories}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Category
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="e.g. iPhone" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Category description..." />
          </Form.Item>

          <Form.Item
            label="Image URL"
            name="image"
            rules={[{ required: true, message: "Please enter image URL" }]}
          >
            <Input placeholder="https://example.com/category-image.jpg" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
