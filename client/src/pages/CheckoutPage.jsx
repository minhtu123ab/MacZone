import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Form,
  Input,
  Radio,
  Divider,
  Breadcrumb,
  Spin,
  Empty,
  Space,
  message,
  Alert,
  Modal,
} from "antd";
import {
  ShoppingCartOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BankOutlined,
  CopyOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/layout/PageLayout";
import useCartStore from "../store/useCartStore";
import useOrderStore from "../store/useOrderStore";
import useAuthStore from "../store/useAuthStore";
import { ROUTES } from "../constants";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, fetchCart, loading: cartLoading } = useCartStore();
  const { createOrder, loading: orderLoading } = useOrderStore();
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [bankingModalVisible, setBankingModalVisible] = useState(false);
  const [transferRef, setTransferRef] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        customer_name: user.full_name || "",
        phone_number: user.phone || "",
        shipping_address: user.address || "",
      });
    }
  }, [user, form]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmit = async (values) => {
    if (!cart || cart.items.length === 0) {
      message.error("Your cart is empty");
      return;
    }

    const paymentMethod = values.payment_method || "COD";

    // Handle different payment methods
    if (paymentMethod === "banking") {
      // Generate new reference code for this transaction
      if (!transferRef) {
        setTransferRef(generateTransferRef());
      }
      // Show banking information modal
      setBankingModalVisible(true);
      return;
    }

    if (paymentMethod === "credit_card") {
      message.info("Credit card payment will be available soon!");
      return;
    }

    // COD - Create order directly
    await processOrder(values);
  };

  const processOrder = async (values) => {
    setSubmitting(true);
    try {
      const orderData = {
        customer_name: values.customer_name,
        phone_number: values.phone_number,
        shipping_address: values.shipping_address,
        payment_method: values.payment_method || "COD",
        note: values.note || "",
        transfer_reference: values.transfer_reference || "",
      };

      const result = await createOrder(orderData);

      // Navigate to order detail page
      navigate(ROUTES.ORDER_DETAIL(result.order._id), {
        state: { fromCheckout: true },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      // Error is already handled by useOrderStore
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankingConfirm = async () => {
    setBankingModalVisible(false);
    const values = form.getFieldsValue();
    // Add transfer reference to order data
    values.transfer_reference = transferRef;
    await processOrder(values);
    // Reset transfer ref after order is placed
    setTransferRef("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard!");
  };

  // Generate transfer reference code once
  const generateTransferRef = () => {
    if (!user) return "";
    const userId = user.id || user._id || "";
    const userCode = userId.slice(-6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `MZ${userCode}${timestamp}`;
  };

  // Generate reference code when banking modal opens
  useEffect(() => {
    if (bankingModalVisible && !transferRef) {
      setTransferRef(generateTransferRef());
    }
  }, [bankingModalVisible]);

  if (cartLoading && !cart) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Loading...">
            <div className="w-full h-32"></div>
          </Spin>
        </div>
      </PageLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-3xl p-16 border border-white/10">
              <Empty
                image={
                  <ShoppingCartOutlined className="text-8xl text-apple-gray" />
                }
                description={
                  <div className="space-y-2 mt-8">
                    <Title level={3} className="!text-white">
                      Your cart is empty
                    </Title>
                    <Text className="!text-apple-gray !text-base">
                      Please add items to cart before checkout
                    </Text>
                  </div>
                }
              >
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate(ROUTES.PRODUCTS)}
                  className="!mt-6 !h-12 !text-base !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none"
                >
                  Start Shopping
                </Button>
              </Empty>
            </div>
          </div>
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
                href: ROUTES.CART,
                title: <span className="text-apple-gray">Cart</span>,
              },
              {
                title: <span className="text-white">Checkout</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <CreditCardOutlined className="text-apple-blue text-3xl" />
            <Title level={2} className="!text-white !mb-0">
              Checkout
            </Title>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card
                className="!bg-transparent !border-white/10 glass rounded-2xl"
                styles={{ body: { padding: "2rem" } }}
              >
                <Title level={4} className="!text-white !mb-6">
                  Shipping Information
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    payment_method: "COD",
                  }}
                >
                  <Form.Item
                    label={<Text className="!text-white">Full Name</Text>}
                    name="customer_name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                      {
                        min: 2,
                        max: 100,
                        message: "Name must be between 2-100 characters",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-apple-gray" />}
                      placeholder="Nguyen Van A"
                      size="large"
                      className="!bg-dark-bg !border-dark-border !text-white hover:!border-apple-blue focus:!border-apple-blue"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<Text className="!text-white">Phone Number</Text>}
                    name="phone_number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Phone number must be 10-11 digits",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-apple-gray" />}
                      placeholder="0901234567"
                      size="large"
                      className="!bg-dark-bg !border-dark-border !text-white hover:!border-apple-blue focus:!border-apple-blue"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text className="!text-white">Shipping Address</Text>
                    }
                    name="shipping_address"
                    rules={[
                      {
                        required: true,
                        message: "Please enter shipping address",
                      },
                      {
                        min: 10,
                        max: 500,
                        message: "Address must be between 10-500 characters",
                      },
                    ]}
                  >
                    <TextArea
                      prefix={
                        <EnvironmentOutlined className="text-apple-gray" />
                      }
                      placeholder="123 Le Loi, District 1, Ho Chi Minh City"
                      size="large"
                      rows={3}
                      className="!bg-dark-bg !border-dark-border !text-white hover:!border-apple-blue focus:!border-apple-blue"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text className="!text-white">Order Note (Optional)</Text>
                    }
                    name="note"
                  >
                    <TextArea
                      prefix={<FileTextOutlined className="text-apple-gray" />}
                      placeholder="Any special instructions for your order?"
                      size="large"
                      rows={2}
                      maxLength={500}
                      showCount
                      className="!bg-dark-bg !border-dark-border !text-white hover:!border-apple-blue focus:!border-apple-blue"
                    />
                  </Form.Item>

                  <Divider className="!bg-dark-border" />

                  <Title level={4} className="!text-white !mb-4">
                    Payment Method
                  </Title>

                  <Form.Item name="payment_method">
                    <Radio.Group
                      className="w-full"
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                      <Space direction="vertical" className="w-full">
                        <Radio
                          value="COD"
                          className="!text-white w-full glass !p-4 !rounded-xl !border-dark-border hover:!border-apple-blue"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💵</span>
                              <div>
                                <Text className="!text-white !font-semibold !block">
                                  Cash on Delivery (COD)
                                </Text>
                                <Text className="!text-apple-gray !text-xs">
                                  Pay when you receive your order
                                </Text>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-semibold">
                              Recommended
                            </span>
                          </div>
                        </Radio>

                        {selectedPaymentMethod === "COD" && (
                          <Alert
                            message="Cash on Delivery"
                            description="You will pay in cash when receiving your order. Please prepare the exact amount."
                            type="info"
                            showIcon
                            icon={<InfoCircleOutlined />}
                            className="!bg-blue-500/10 !border-blue-500/30 glass ml-12"
                          />
                        )}

                        <Radio
                          value="banking"
                          className="!text-white w-full glass !p-4 !rounded-xl !border-dark-border hover:!border-apple-blue"
                        >
                          <div className="flex items-center gap-3">
                            <BankOutlined className="text-2xl text-apple-blue" />
                            <div>
                              <Text className="!text-white !font-semibold !block">
                                Bank Transfer
                              </Text>
                              <Text className="!text-apple-gray !text-xs">
                                Transfer to our bank account
                              </Text>
                            </div>
                          </div>
                        </Radio>

                        {selectedPaymentMethod === "banking" && (
                          <Alert
                            message="Bank Transfer Instructions"
                            description="After placing order, you will see bank account details to complete the transfer."
                            type="warning"
                            showIcon
                            icon={<InfoCircleOutlined />}
                            className="!bg-yellow-500/10 !border-yellow-500/30 glass ml-12"
                          />
                        )}

                        <Radio
                          value="credit_card"
                          className="!text-white w-full glass !p-4 !rounded-xl !border-dark-border hover:!border-apple-blue"
                          disabled
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCardOutlined className="text-2xl text-apple-gray" />
                              <div>
                                <Text className="!text-white !font-semibold !block">
                                  Credit Card
                                </Text>
                                <Text className="!text-apple-gray !text-xs">
                                  Pay with Visa, Mastercard, JCB
                                </Text>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-apple-gray/20 text-apple-gray text-xs">
                              Coming Soon
                            </span>
                          </div>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item className="!mb-0 !mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={submitting || orderLoading}
                      icon={<CheckCircleOutlined />}
                      className="!h-14 !text-lg !font-bold !bg-apple-blue hover:!bg-apple-blue-light !border-none shadow-lg shadow-apple-blue/50"
                    >
                      Place Order
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 border border-white/10 sticky top-24">
                <Title level={4} className="!text-white !mb-6">
                  Order Summary
                </Title>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/30 to-transparent flex-shrink-0">
                        {item.product.thumbnail_url ||
                        item.variant.image_url ? (
                          <img
                            src={
                              item.variant.image_url ||
                              item.product.thumbnail_url
                            }
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                            📱
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="!text-white !text-sm !font-medium !block truncate">
                          {item.product.name}
                        </Text>
                        <Text className="!text-apple-gray !text-xs">
                          {item.variant.color} - {item.variant.storage}
                        </Text>
                        <Text className="!text-apple-gray !text-xs">
                          × {item.quantity}
                        </Text>
                      </div>
                      <Text className="!text-white !font-semibold">
                        {formatPrice(item.subtotal)}
                      </Text>
                    </div>
                  ))}
                </div>

                <Divider className="!bg-dark-border" />

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text className="!text-apple-gray">Subtotal</Text>
                    <Text className="!text-white !font-semibold">
                      {formatPrice(cart.total_price)}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="!text-apple-gray">Shipping</Text>
                    <Text className="!text-green-500 !font-semibold">Free</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="!text-apple-gray">Tax</Text>
                    <Text className="!text-white !font-semibold">Included</Text>
                  </div>

                  <Divider className="!bg-dark-border !my-4" />

                  <div className="flex justify-between items-center">
                    <Text className="!text-white !text-lg !font-bold">
                      Total
                    </Text>
                    <Title level={3} className="!text-apple-blue !mb-0">
                      {formatPrice(cart.total_price)}
                    </Title>
                  </div>
                </div>

                {/* Policies */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <Text className="!text-apple-gray !text-xs">
                        Free shipping on all orders
                      </Text>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <Text className="!text-apple-gray !text-xs">
                        30-day return policy
                      </Text>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <Text className="!text-apple-gray !text-xs">
                        Secure payment processing
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Information Modal */}
          <Modal
            title={
              <div className="flex items-center gap-2">
                <BankOutlined className="text-apple-blue" />
                <span>Bank Transfer Information</span>
              </div>
            }
            open={bankingModalVisible}
            onOk={handleBankingConfirm}
            onCancel={() => setBankingModalVisible(false)}
            okText="I've Transferred"
            cancelText="Cancel"
            okButtonProps={{
              loading: submitting,
              className: "!bg-apple-blue hover:!bg-apple-blue-light",
            }}
            width={750}
            centered
            className="banking-modal"
          >
            <div className="py-2">
              <div className="flex gap-4">
                {/* QR Code - Left Side */}
                <div className="flex-shrink-0">
                  <div className="text-center">
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `Bank: Vietcombank\nAccount: 1234567890\nName: CONG TY MACZONE\nAmount: ${
                            cart?.total_price || 0
                          }\nContent: ${transferRef || ""}`
                        )}`}
                        alt="QR Code"
                        className="w-[180px] h-[180px]"
                      />
                    </div>
                    <Text className="!text-apple-gray !text-xs !block mt-2">
                      Scan QR Code
                    </Text>
                  </div>
                </div>

                {/* Bank Details - Right Side */}
                <Card className="!bg-gradient-to-br from-blue-900/20 to-purple-900/20 !border-apple-blue/30 flex-1">
                  <div className="space-y-4">
                    {/* Bank Name and Account Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text className="!text-apple-gray !text-xs !block mb-1">
                          Bank Name
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="!text-white !font-bold !flex-1">
                            Vietcombank
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard("Vietcombank")}
                            className="!text-apple-blue !p-0"
                          />
                        </div>
                      </div>

                      <div>
                        <Text className="!text-apple-gray !text-xs !block mb-1">
                          Account Name
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="!text-white !font-bold !flex-1">
                            CONG TY MACZONE
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard("CONG TY MACZONE")}
                            className="!text-apple-blue !p-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Number - Full Width */}
                    <div>
                      <Text className="!text-apple-gray !text-xs !block mb-1">
                        Account Number
                      </Text>
                      <div className="flex items-center gap-2">
                        <Text className="!text-white !text-xl !font-mono !font-bold !flex-1">
                          1234567890
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard("1234567890")}
                          className="!text-apple-blue !p-0"
                        />
                      </div>
                    </div>

                    {/* Amount and Transfer Content */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text className="!text-apple-gray !text-xs !block mb-1">
                          Amount
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="!text-apple-blue !text-lg !font-bold !flex-1 whitespace-nowrap">
                            {cart && formatPrice(cart.total_price)}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(cart?.total_price)}
                            className="!text-apple-blue !p-0"
                          />
                        </div>
                      </div>

                      <div>
                        <Text className="!text-apple-gray !text-xs !block mb-1">
                          Transfer Content (Reference Code)
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text className="!text-white !font-mono !text-base !font-bold !flex-1 whitespace-nowrap">
                            {transferRef || "Loading..."}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(transferRef)}
                            className="!text-apple-blue !p-0"
                            disabled={!transferRef}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Alert
                message={
                  <div>
                    <Text className="!text-xs !font-semibold !block mb-1">
                      Important:
                    </Text>
                    <Text className="!text-xs">
                      Transfer exact amount and use the reference code above as
                      transfer content. Processing time: 1-24 hours.
                    </Text>
                  </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="!bg-blue-500/10 !border-blue-500/30 !mt-3"
              />
            </div>
          </Modal>
        </div>
      </div>
    </PageLayout>
  );
}
