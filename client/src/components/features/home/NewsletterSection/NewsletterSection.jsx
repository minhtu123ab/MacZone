import { useState } from "react";
import { Typography, Input, Button, App } from "antd";
import { MailOutlined, SendOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubscribe = async () => {
    if (!email) {
      message.warning("Please enter your email!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error("Please enter a valid email!");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success("Thank you for subscribing!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="glass rounded-3xl p-12 text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-apple-blue/10 text-apple-blue mb-6">
        <MailOutlined className="text-3xl" />
      </div>

      <Title level={2} className="!text-white !mb-4">
        Stay Updated
      </Title>

      <Paragraph className="!text-apple-gray !text-lg !mb-8">
        Subscribe to our newsletter for exclusive deals, new arrivals, and tech
        tips!
      </Paragraph>

      <div className="flex gap-3 max-w-md mx-auto">
        <Input
          size="large"
          placeholder="Enter your email"
          prefix={<MailOutlined className="!text-apple-gray" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={handleSubscribe}
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSubscribe}
          className="glow h-12"
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
}
