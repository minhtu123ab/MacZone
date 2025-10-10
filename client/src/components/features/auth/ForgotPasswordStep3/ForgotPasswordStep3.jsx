import { Form, Input, Button, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Paragraph } = Typography;

export default function ForgotPasswordStep3({ onSubmit, loading }) {
  return (
    <div>
      <Paragraph className="!text-apple-gray !mb-6">
        Enter your new password. Make sure it&apos;s at least 6 characters long.
      </Paragraph>

      <Form
        name="reset-password"
        onFinish={onSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="new_password"
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="!text-apple-gray" />}
            placeholder="New Password"
            className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
          />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          dependencies={["new_password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
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

        <Form.Item className="!mb-0">
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="!h-12 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

ForgotPasswordStep3.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
