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
  Tabs,
  InputNumber,
  Upload,
  Divider,
  Row,
  Col,
  List,
  Empty,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarFilled,
  UploadOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  adminAPI,
  categoryAPI,
  variantAPI,
  productImageAPI,
  uploadAPI,
} from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

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

  // Manage Product Modal
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [managingProduct, setManagingProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [variantForm] = Form.useForm();
  const [imageLoading, setImageLoading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [variantImageUploading, setVariantImageUploading] = useState(false);
  const [uploadFileList, setUploadFileList] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);

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

  // Upload thumbnail with Cloudinary
  const handleThumbnailUpload = async (info) => {
    const { file } = info;

    // Get the actual file object
    const fileToUpload = file.originFileObj || file;

    if (!fileToUpload) {
      return;
    }

    try {
      setThumbnailUploading(true);
      const response = await uploadAPI.uploadImage(
        fileToUpload,
        "products/thumbnails"
      );
      if (response.data.success) {
        form.setFieldsValue({ thumbnail_url: response.data.data.url });
        message.success("Thumbnail uploaded successfully");
      }
    } catch (error) {
      message.error("Failed to upload thumbnail");
      console.error("Upload error:", error);
    } finally {
      setThumbnailUploading(false);
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

  // ========== Manage Product (Variants & Images) ==========

  const handleManageProduct = async (product) => {
    setManagingProduct(product);
    setManageModalVisible(true);
    await fetchVariantsAndImages(product._id);
  };

  const fetchVariantsAndImages = async (productId) => {
    try {
      setImageLoading(true);
      const [variantsRes, imagesRes] = await Promise.all([
        variantAPI.getByProduct(productId),
        productImageAPI.getByProduct(productId),
      ]);

      if (variantsRes.data.success) {
        setVariants(variantsRes.data.data);
      }
      if (imagesRes.data.success) {
        setProductImages(imagesRes.data.data);
      }
    } catch (error) {
      message.error("Failed to fetch product details");
    } finally {
      setImageLoading(false);
    }
  };

  // ========== Variant Management ==========

  const handleAddVariant = async (values) => {
    try {
      if (editingVariant) {
        // Update existing variant
        const response = await variantAPI.update(editingVariant._id, values);
        if (response.data.success) {
          message.success("Variant updated successfully");
          setEditingVariant(null);
          variantForm.resetFields();
          await fetchVariantsAndImages(managingProduct._id);
        }
      } else {
        // Create new variant
        const response = await variantAPI.create(managingProduct._id, values);
        if (response.data.success) {
          message.success("Variant added successfully");
          variantForm.resetFields();
          await fetchVariantsAndImages(managingProduct._id);
        }
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          `Failed to ${editingVariant ? "update" : "add"} variant`
      );
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    variantForm.setFieldsValue({
      color: variant.color,
      storage: variant.storage,
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
      image_url: variant.image_url,
      is_active: variant.is_active,
    });
  };

  const handleCancelEditVariant = () => {
    setEditingVariant(null);
    variantForm.resetFields();
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const response = await variantAPI.delete(variantId);
      if (response.data.success) {
        message.success("Variant deleted successfully");
        await fetchVariantsAndImages(managingProduct._id);
      }
    } catch (error) {
      message.error("Failed to delete variant");
    }
  };

  const handleVariantImageUpload = async (file) => {
    try {
      const fileToUpload = file.originFileObj || file;
      if (!fileToUpload) return;

      setVariantImageUploading(true);
      const response = await uploadAPI.uploadImage(
        fileToUpload,
        "products/variants"
      );
      if (response.data.success) {
        variantForm.setFieldsValue({ image_url: response.data.data.url });
        message.success("Variant image uploaded");
      }
    } catch (error) {
      message.error("Failed to upload variant image");
      console.error("Upload error:", error);
    } finally {
      setVariantImageUploading(false);
    }
  };

  // ========== Product Images Management ==========

  const handleImagesUpload = async (fileList) => {
    try {
      setImageLoading(true);
      const files = fileList.map((file) => file.originFileObj);
      const response = await uploadAPI.uploadMultipleImages(
        files,
        "products/gallery"
      );

      if (response.data.success) {
        // Add all uploaded images to product
        const uploadedImages = response.data.data;

        // Get max display_order from existing images
        const maxDisplayOrder =
          productImages.length > 0
            ? Math.max(...productImages.map((img) => img.display_order || 0))
            : -1;

        const addPromises = uploadedImages.map((img, index) =>
          productImageAPI.create(managingProduct._id, {
            image_url: img.url,
            display_order: maxDisplayOrder + 1 + index,
            alt_text: managingProduct.name,
          })
        );

        await Promise.all(addPromises);
        message.success(`${uploadedImages.length} image(s) added successfully`);
        setUploadFileList([]); // Clear file list after successful upload
        await fetchVariantsAndImages(managingProduct._id);
      }
    } catch (error) {
      message.error("Failed to upload images");
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await productImageAPI.delete(imageId);
      if (response.data.success) {
        message.success("Image deleted successfully");
        await fetchVariantsAndImages(managingProduct._id);
      }
    } catch (error) {
      message.error("Failed to delete image");
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
          src={
            url ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='14px' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
          }
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
      width: 230,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/products/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Manage Variants & Images">
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              onClick={() => handleManageProduct(record)}
              style={{ color: "#1890ff" }}
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

  const variantColumns = [
    {
      title: "Image",
      dataIndex: "image_url",
      render: (url) => (
        <Image
          src={
            url ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12px' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
          }
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
    },
    {
      title: "Storage",
      dataIndex: "storage",
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `${price?.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (stock) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock}
        </Tag>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
    },
    {
      title: "Active",
      dataIndex: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditVariant(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this variant?"
            onConfirm={() => handleDeleteVariant(record._id)}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
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
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
              allowClear
              className="mb-4"
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
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, is_active: value }))
              }
              allowClear
              className="mb-4"
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Add/Edit Product Modal */}
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
        centered
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            overflowX: "hidden",
          },
        }}
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
            label="Thumbnail Image"
            name="thumbnail_url"
            rules={[{ required: true, message: "Please upload thumbnail" }]}
          >
            <Input placeholder="Image URL" disabled />
          </Form.Item>

          <Form.Item label="Upload Thumbnail">
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              onChange={handleThumbnailUpload}
              showUploadList={false}
            >
              <Button
                icon={<UploadOutlined />}
                loading={thumbnailUploading}
                block
              >
                {thumbnailUploading ? "Uploading..." : "Click to Upload Image"}
              </Button>
            </Upload>
            {form.getFieldValue("thumbnail_url") && (
              <div style={{ marginTop: 10 }}>
                <Image
                  src={form.getFieldValue("thumbnail_url")}
                  width={150}
                  style={{ borderRadius: 8 }}
                />
              </div>
            )}
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

      {/* Manage Product (Variants & Images) Modal */}
      <Modal
        title={`Manage: ${managingProduct?.name || ""}`}
        open={manageModalVisible}
        onCancel={() => {
          setManageModalVisible(false);
          setManagingProduct(null);
          setVariants([]);
          setProductImages([]);
          setUploadFileList([]);
          setEditingVariant(null);
          variantForm.resetFields();
        }}
        footer={null}
        width={1000}
        centered
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            overflowX: "hidden",
          },
        }}
      >
        <Tabs
          defaultActiveKey="variants"
          className="pr-2"
          items={[
            {
              key: "variants",
              label: "Variants",
              children: (
                <>
                  <Divider orientation="left">
                    {editingVariant ? "Edit Variant" : "Add New Variant"}
                  </Divider>
                  <Form
                    form={variantForm}
                    layout="vertical"
                    onFinish={handleAddVariant}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Color"
                          name="color"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input
                            placeholder="e.g. Gold, Silver"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Storage" name="storage">
                          <Input
                            placeholder="e.g. 128GB, 256GB (Optional)"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Price (₫)"
                          name="price"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <InputNumber
                            min={0}
                            size="large"
                            style={{ width: "100%" }}
                            formatter={(value) =>
                              value.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Stock"
                          name="stock"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <InputNumber
                            min={0}
                            size="large"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="SKU" name="sku">
                          <Input
                            placeholder="Optional SKU"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Active"
                          name="is_active"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Variant Image URL" name="image_url">
                      <Input
                        placeholder="Image URL (optional)"
                        disabled
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item label="Upload Variant Image">
                      <Upload
                        maxCount={1}
                        accept="image/*"
                        beforeUpload={() => false}
                        onChange={(info) => handleVariantImageUpload(info.file)}
                        showUploadList={false}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={variantImageUploading}
                          disabled={variantImageUploading}
                        >
                          {variantImageUploading
                            ? "Uploading..."
                            : "Upload Variant Image"}
                        </Button>
                      </Upload>
                      {variantForm.getFieldValue("image_url") && (
                        <Image
                          src={variantForm.getFieldValue("image_url")}
                          width={100}
                          style={{ marginTop: 10, borderRadius: 4 }}
                        />
                      )}
                    </Form.Item>

                    <Form.Item>
                      {editingVariant ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            style={{ flex: 1 }}
                          >
                            Update Variant
                          </Button>
                          <Button
                            onClick={handleCancelEditVariant}
                            style={{ flex: 1 }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button type="primary" htmlType="submit" block>
                          Add Variant
                        </Button>
                      )}
                    </Form.Item>
                  </Form>

                  <Divider orientation="left">Existing Variants</Divider>
                  <Table
                    columns={variantColumns}
                    dataSource={variants}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                  />
                </>
              ),
            },
            {
              key: "images",
              label: "Product Images",
              children: (
                <>
                  <Spin spinning={imageLoading}>
                    <Divider orientation="left">Upload Images</Divider>
                    <Dragger
                      multiple
                      fileList={uploadFileList}
                      beforeUpload={() => false}
                      onChange={(info) => {
                        setUploadFileList(info.fileList);
                      }}
                      showUploadList={true}
                      onRemove={(file) => {
                        setUploadFileList(
                          uploadFileList.filter((f) => f.uid !== file.uid)
                        );
                      }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag files to upload
                      </p>
                      <p className="ant-upload-hint">
                        Support multiple images. Max 10 images per upload.
                      </p>
                    </Dragger>

                    {uploadFileList.length > 0 && (
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => handleImagesUpload(uploadFileList)}
                        loading={imageLoading}
                        block
                        style={{ marginTop: 16 }}
                      >
                        Upload {uploadFileList.length} Image(s)
                      </Button>
                    )}

                    <Divider orientation="left">Existing Images</Divider>
                    {productImages.length === 0 ? (
                      <Empty description="No images uploaded yet" />
                    ) : (
                      <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={productImages}
                        renderItem={(item) => (
                          <List.Item>
                            <Card
                              hoverable
                              cover={
                                <Image
                                  src={item.image_url}
                                  alt={item.alt_text}
                                  height={150}
                                  style={{ objectFit: "cover" }}
                                />
                              }
                              actions={[
                                <Popconfirm
                                  key="delete"
                                  title="Delete this image?"
                                  onConfirm={() => handleDeleteImage(item._id)}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                  >
                                    Delete
                                  </Button>
                                </Popconfirm>,
                              ]}
                            >
                              <Card.Meta
                                description={`Order: ${item.display_order}`}
                              />
                            </Card>
                          </List.Item>
                        )}
                      />
                    )}
                  </Spin>
                </>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ProductManagement;
