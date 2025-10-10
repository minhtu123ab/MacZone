import { Form, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

export default function ProfileInfo({ form, onSubmit, loading }) {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} size="large">
      <Form.Item
        label={<span className="!text-apple-gray-light">Full Name</span>}
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
        label={<span className="!text-apple-gray-light">Email</span>}
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
        label={<span className="!text-apple-gray-light">Phone Number</span>}
        name="phone"
      >
        <Input
          prefix={<PhoneOutlined className="!text-apple-gray" />}
          placeholder="Phone Number"
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item
        label={<span className="!text-apple-gray-light">Address</span>}
        name="address"
      >
        <Input.TextArea
          placeholder="Address"
          rows={3}
          className="!bg-dark-hover !border-dark-border hover:!border-apple-blue focus:!border-apple-blue"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          icon={<SaveOutlined />}
          className="!h-12 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
        >
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}

ProfileInfo.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

