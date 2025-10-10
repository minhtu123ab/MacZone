import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

export default function ChangePassword({ form, onSubmit, loading }) {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} size="large">
      <Form.Item
        label={<span className="!text-apple-gray-light">Current Password</span>}
        name="current_password"
        rules={[
          { required: true, message: "Please input your current password!" },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="!text-apple-gray" />}
          placeholder="Current Password"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item
        label={<span className="!text-apple-gray-light">New Password</span>}
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
        label={
          <span className="!text-apple-gray-light">Confirm New Password</span>
        }
        name="confirm_password"
        dependencies={["new_password"]}
        hasFeedback
        rules={[
          { required: true, message: "Please confirm your new password!" },
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
          placeholder="Confirm New Password"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          icon={<LockOutlined />}
          className="!h-12 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
        >
          Change Password
        </Button>
      </Form.Item>
    </Form>
  );
}

ChangePassword.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

