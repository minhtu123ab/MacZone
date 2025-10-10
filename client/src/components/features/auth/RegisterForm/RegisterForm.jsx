import { Form, Input, Button, Checkbox } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  AppleOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

export default function RegisterForm({ onSubmit, loading }) {
  return (
    <Form
      name="register"
      onFinish={onSubmit}
      layout="vertical"
      size="large"
      scrollToFirstError
      autoComplete="off"
    >
      <Form.Item
        name="full_name"
        rules={[
          { required: true, message: "Please input your full name!" },
          { min: 2, message: "Name must be at least 2 characters!" },
        ]}
      >
        <Input
          prefix={<UserOutlined className="!text-apple-gray" />}
          placeholder="Full Name"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

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

      <Form.Item
        name="password"
        rules={[
          { required: true, message: "Please input your password!" },
          { min: 6, message: "Password must be at least 6 characters!" },
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined className="!text-apple-gray" />}
          placeholder="Password"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item
        name="confirm_password"
        dependencies={["password"]}
        hasFeedback
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="!text-apple-gray" />}
          placeholder="Confirm Password"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item
        name="agree"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error("Please accept the terms")),
          },
        ]}
      >
        <Checkbox className="!text-apple-gray-light">
          I agree to the{" "}
          <span className="text-apple-blue-light">Terms of Service</span> and{" "}
          <span className="text-apple-blue-light">Privacy Policy</span>
        </Checkbox>
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
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );
}

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

