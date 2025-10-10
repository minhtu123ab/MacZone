import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined, AppleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

export default function LoginForm({ onSubmit, loading, onForgotPassword }) {
  return (
    <Form
      name="login"
      onFinish={onSubmit}
      layout="vertical"
      size="large"
      autoComplete="off"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input
          prefix={<UserOutlined className="!text-apple-gray" />}
          placeholder="Email"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          prefix={<LockOutlined className="!text-apple-gray" />}
          placeholder="Password"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-between items-center">
          <Checkbox className="!text-apple-gray-light">Remember me</Checkbox>
          <Button
            type="link"
            onClick={onForgotPassword}
            className="!p-0 !text-apple-blue-light hover:!text-apple-blue"
          >
            Forgot password?
          </Button>
        </div>
      </Form.Item>

      <Form.Item className="!mb-0">
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className="!h-12 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
          icon={<AppleOutlined />}
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onForgotPassword: PropTypes.func,
};

