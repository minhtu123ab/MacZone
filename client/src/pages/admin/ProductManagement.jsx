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
  Image,
  Switch,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminAPI, categoryAPI } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    is_active: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, filters, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearch,
        category: filters.category,
        is_active: filters.is_active,
      };

      const response = await adminAPI.getAllProducts(params);
      if (response.data.success) {
        setProducts(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch products");
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

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      category_id: product.category_id?._id,
      thumbnail_url: product.thumbnail_url,
      is_active: product.is_active,
    });
    setModalVisible(true);
  };

  const handleDelete = async (productId) => {
    try {
      const response = await adminAPI.deleteProduct(productId);
      if (response.data.success) {
        message.success("Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  };

  const handleToggleStatus = async (productId, is_active) => {
    try {
      const response = await adminAPI.updateProduct(productId, { is_active });
      if (response.data.success) {
        message.success(`Product ${is_active ? "activated" : "deactivated"}`);
        fetchProducts();
      }
    } catch (error) {
      message.error("Failed to update product status");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        const response = await adminAPI.updateProduct(
          editingProduct._id,
          values
        );
        if (response.data.success) {
          message.success("Product updated successfully");
          setModalVisible(false);
          fetchProducts();
          form.resetFields();
        }
      } else {
        const response = await adminAPI.createProduct(values);
        if (response.data.success) {
          message.success("Product created successfully");
          setModalVisible(false);
          fetchProducts();
          form.resetFields();
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "thumbnail_url",
      key: "thumbnail_url",
      width: 80,
      render: (url) => (
        <Image
          src={url || "https://via.placeholder.com/60"}
          alt="Product"
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 250,
    },
    {
      title: "Category",
      dataIndex: ["category_id", "name"],
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Rating",
      dataIndex: "average_rating",
      key: "average_rating",
      render: (rating, record) => (
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <StarFilled style={{ color: "#3b82f6", fontSize: "16px" }} />
          <span style={{ color: "#3b82f6" }}>
            {rating?.toFixed(1) || 0} ({record.review_count || 0})
          </span>
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active, record) => (
        <Switch
          checked={is_active}
          onChange={(checked) => handleToggleStatus(record._id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
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
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/products/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this product?"
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
        title="Product Management"
        extra={
          <Space align="center">
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Category"
              style={{ width: 150 }}
              className="mb-4"
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
              allowClear
            >
              <Option value="">All Categories</Option>
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              style={{ width: 120 }}
              className="mb-4"
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, is_active: value }))
              }
              allowClear
            >
              <Option value="">All Status</Option>
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchProducts}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Product
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="e.g. iPhone 15 Pro Max" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category_id"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Product description..." />
          </Form.Item>

          <Form.Item
            label="Thumbnail URL"
            name="thumbnail_url"
            rules={[{ required: true, message: "Please enter thumbnail URL" }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
