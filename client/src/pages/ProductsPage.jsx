import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Card,
  Input,
  Select,
  Spin,
  Empty,
  Pagination,
  message,
  Button,
  Breadcrumb,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import { CompareButton } from "../components";
import { productAPI, categoryAPI } from "../services/api";
import { ROUTES } from "../constants";
import { useDebounce } from "../hooks/useDebounce";

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Get params from URL
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "-createdAt";
  const pageParam = parseInt(searchParams.get("page")) || 1;

  // Separate state for search input (immediate update)
  const [searchInput, setSearchInput] = useState(searchParam);

  // Debounced search value (delayed update)
  const debouncedSearch = useDebounce(searchInput, 500);

  const [filters, setFilters] = useState({
    category: categoryParam,
    search: searchParam,
    sort: sortParam,
    page: pageParam,
    limit: 12,
  });

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Update filters.search when debounced search value changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1, // Reset to page 1 when search changes
    }));
  }, [debouncedSearch]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          ...(filters.category && { category: filters.category }),
          ...(filters.search && { search: filters.search }),
          sort: filters.sort,
          page: filters.page,
          limit: filters.limit,
        };

        const response = await productAPI.getAll(params);
        setProducts(response.data.data || []);
        setTotal(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
        message.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.sort !== "-createdAt") params.sort = filters.sort;
    if (filters.page > 1) params.page = filters.page;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when filter changes
    }));
  };

  const handleProductClick = (productId) => {
    navigate(ROUTES.PRODUCT_DETAIL(productId));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const sortOptions = [
    { value: "-createdAt", label: "Newest First" },
    { value: "createdAt", label: "Oldest First" },
    { value: "name", label: "Name: A-Z" },
    { value: "-name", label: "Name: Z-A" },
    { value: "average_rating", label: "Rating: Low to High" },
    { value: "-average_rating", label: "Rating: High to Low" },
  ];

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
                title: <span className="text-white">Products</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="mb-12">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-apple-blue to-blue-600 flex items-center justify-center shadow-lg shadow-apple-blue/50">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <Title
                  level={2}
                  className="!text-white !mb-0 !text-4xl !font-bold"
                >
                  Shop Premium Apple Products
                </Title>
              </div>
              <Paragraph className="!text-gray-400 !text-lg max-w-2xl mx-auto">
                Discover our curated collection of the latest iPhones, MacBooks,
                iPads, and accessories
              </Paragraph>
            </div>
          </div>

          {/* Filters */}
          <div className="glass rounded-3xl p-8 mb-12 border border-white/10 hover:border-apple-blue/30 transition-all duration-300">
            <Row gutter={[16, 16]}>
              {/* Search */}
              <Col xs={24} md={8}>
                <Input
                  size="large"
                  placeholder="Search products..."
                  prefix={<SearchOutlined className="text-apple-blue" />}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  allowClear
                  onClear={() => setSearchInput("")}
                  className="!h-12 !bg-dark-hover/50 !border-dark-border hover:!border-apple-blue focus:!border-apple-blue !rounded-xl transition-all duration-300"
                />
              </Col>

              {/* Category Filter */}
              <Col xs={24} md={8}>
                <Select
                  size="large"
                  placeholder="All Categories"
                  value={filters.category || undefined}
                  onChange={(value) => handleFilterChange("category", value)}
                  allowClear
                  suffixIcon={<FilterOutlined className="text-apple-blue" />}
                  className="w-full !h-12"
                  popupClassName="custom-select-dropdown"
                  options={[
                    { value: "", label: "All Categories" },
                    ...categories.map((cat) => ({
                      value: cat._id,
                      label: cat.name,
                    })),
                  ]}
                />
              </Col>

              {/* Sort */}
              <Col xs={24} md={8}>
                <Select
                  size="large"
                  value={filters.sort}
                  onChange={(value) => handleFilterChange("sort", value)}
                  className="w-full !h-12"
                  popupClassName="custom-select-dropdown"
                  options={sortOptions}
                />
              </Col>
            </Row>

            {/* Result count */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-apple-blue rounded-full animate-pulse"></div>
                <Text className="!text-white !font-semibold">
                  Showing {products.length} of {total} products
                </Text>
              </div>
              {(filters.category || filters.search) && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    setSearchInput("");
                    setFilters({
                      category: "",
                      search: "",
                      sort: "-createdAt",
                      page: 1,
                      limit: 12,
                    });
                  }}
                  className="!text-apple-blue hover:!text-apple-blue-light"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Loading products..." />
            </div>
          ) : products.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {products.map((product) => (
                  <Col key={product._id} xs={24} sm={12} lg={8}>
                    <div
                      className="relative glass rounded-3xl overflow-hidden hover:shadow-glow-xl transition-all duration-500 cursor-pointer group border border-white/10 hover:border-apple-blue/50 hover:-translate-y-2"
                      onClick={() => handleProductClick(product._id)}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/30 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

                      {/* Image container */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-dark-card overflow-hidden">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-blue/10 to-transparent">
                            <span className="text-7xl opacity-50">📱</span>
                          </div>
                        )}

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-apple-blue/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Category badge */}
                        {product.category_id && (
                          <div className="absolute top-4 right-4 z-20">
                            <div className="glass px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                              <span className="text-white text-xs font-bold tracking-wide">
                                {product.category_id.name}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Compare checkbox */}
                        <div className="absolute top-4 left-4 z-20">
                          <div className="glass px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                            <CompareButton
                              product={product}
                              variant="checkbox"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Content section */}
                      <div className="relative p-6 bg-gradient-to-b from-dark-card/95 via-dark-card to-dark-hover z-20">
                        <Title
                          level={5}
                          className="!text-white !mb-2 !font-bold group-hover:!text-apple-blue-light transition-colors duration-300 line-clamp-2"
                        >
                          {product.name}
                        </Title>

                        <Paragraph className="!text-apple-gray !mb-4 !text-sm !leading-relaxed line-clamp-2">
                          {product.description || "Explore our premium product"}
                        </Paragraph>

                        {/* Rating */}
                        {product.average_rating > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-base transition-all duration-300 ${
                                    i < Math.round(product.average_rating)
                                      ? "text-apple-blue group-hover:scale-110"
                                      : "text-gray-700"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <Text className="!text-xs !text-apple-gray !font-medium">
                              {product.average_rating.toFixed(1)} (
                              {product.review_count})
                            </Text>
                          </div>
                        )}

                        {/* View Details button */}
                        <div className="mt-4 flex items-center gap-2 text-apple-blue group-hover:text-apple-blue-light text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                          <span>View Details</span>
                          <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {total > filters.limit && (
                <div className="mt-12 flex justify-center">
                  <div className="glass rounded-2xl px-6 py-4">
                    <Pagination
                      current={filters.page}
                      total={total}
                      pageSize={filters.limit}
                      onChange={(page) => handleFilterChange("page", page)}
                      showSizeChanger={false}
                      className="custom-pagination"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass rounded-3xl p-20 text-center border border-white/10">
              <div className="mb-8">
                <div className="inline-block relative">
                  <span className="text-8xl">🔍</span>
                  <div className="absolute inset-0 bg-apple-blue/20 blur-3xl rounded-full"></div>
                </div>
              </div>
              <Title level={3} className="!text-white !mb-3">
                No Products Found
              </Title>
              <Paragraph className="!text-apple-gray !text-lg mb-8 max-w-md mx-auto">
                {filters.category || filters.search
                  ? "We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
                  : "No products available at the moment. Please check back later!"}
              </Paragraph>
              {(filters.category || filters.search) && (
                <Button
                  size="large"
                  onClick={() => {
                    setSearchInput("");
                    setFilters({
                      category: "",
                      search: "",
                      sort: "-createdAt",
                      page: 1,
                      limit: 12,
                    });
                  }}
                  className="glass !border-apple-blue !text-white hover:!bg-apple-blue/20 hover:!border-apple-blue-light transition-all duration-300"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
