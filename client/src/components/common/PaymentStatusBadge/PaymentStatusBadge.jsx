import { Tag } from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const statusConfig = {
  unpaid: {
    color: "orange",
    icon: <DollarOutlined />,
    label: "Unpaid",
  },
  paid: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Paid",
  },
  refunded: {
    color: "red",
    icon: <CloseCircleOutlined />,
    label: "Refunded",
  },
};

export default function PaymentStatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig.unpaid;

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      className={`${
        size === "large" ? "!px-4 !py-2 !text-base" : ""
      } !rounded-full !font-semibold`}
    >
      {config.label}
    </Tag>
  );
}
