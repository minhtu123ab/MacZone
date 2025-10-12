import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const statusConfig = {
  pending: {
    color: "gold",
    icon: <ClockCircleOutlined />,
    label: "Pending",
  },
  confirmed: {
    color: "blue",
    icon: <SyncOutlined spin />,
    label: "Confirmed",
  },
  shipping: {
    color: "cyan",
    icon: <TruckOutlined />,
    label: "Shipping",
  },
  completed: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Completed",
  },
  canceled: {
    color: "red",
    icon: <CloseCircleOutlined />,
    label: "Canceled",
  },
};

export default function OrderStatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig.pending;

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
