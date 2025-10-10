import { Form, Input, Button, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Paragraph } = Typography;

export default function ForgotPasswordStep1({ onSubmit, loading }) {
  return (
    <div>
      <Paragraph className="!text-apple-gray !mb-6">
        Enter your email address and we&apos;ll send you a verification code to
        reset your password.
      </Paragraph>

      <Form
        name="forgot-password"
        onFinish={onSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="!text-apple-gray" />}
            placeholder="Email"
            className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="!h-12 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
          >
            Send Verification Code
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

ForgotPasswordStep1.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
