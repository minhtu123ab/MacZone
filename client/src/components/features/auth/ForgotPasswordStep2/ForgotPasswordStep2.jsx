import { useState } from "react";
import { Form, Button, Typography } from "antd";
import PropTypes from "prop-types";
import OTPInput from "../../../common/OTPInput";

const { Paragraph, Text } = Typography;

export default function ForgotPasswordStep2({
  email,
  onSubmit,
  onResend,
  loading,
}) {
  const [form] = Form.useForm();
  const [otpValue, setOtpValue] = useState("");

  const handleOTPChange = (value) => {
    setOtpValue(value);
    form.setFieldsValue({ code: value });
  };

  const handleSubmit = (values) => {
    if (otpValue.length === 6) {
      onSubmit(values);
    }
  };

  return (
    <div>
      <Paragraph className="!text-apple-gray !mb-2">
        We&apos;ve sent a 6-digit verification code to:
      </Paragraph>
      <Text className="!text-apple-blue-light !font-semibold !block !mb-8">
        {email}
      </Text>

      <Form
        form={form}
        name="verify-code"
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="code"
          rules={[
            {
              required: true,
              message: "Please input complete verification code!",
            },
            { len: 6, message: "Code must be 6 digits!" },
          ]}
        >
          <div className="mb-6">
            <OTPInput
              length={6}
              onChange={handleOTPChange}
              disabled={loading}
            />
          </div>
        </Form.Item>

        <Form.Item className="!mb-4">
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={otpValue.length !== 6}
            className="!h-12 !font-semibold glow hover:shadow-glow-lg transition-all duration-300"
          >
            Verify Code
          </Button>
        </Form.Item>

        <div className="text-center">
          <Text className="!text-apple-gray">
            Didn&apos;t receive the code?{" "}
          </Text>
          <Button
            type="link"
            onClick={onResend}
            disabled={loading}
            className="!p-0 !text-apple-blue-light hover:!text-apple-blue"
          >
            Resend
          </Button>
        </div>
      </Form>
    </div>
  );
}

ForgotPasswordStep2.propTypes = {
  email: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
