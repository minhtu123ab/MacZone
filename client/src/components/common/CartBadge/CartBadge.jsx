import { Badge, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import useCartStore from "../../../store/useCartStore";

export default function CartBadge({ onClick }) {
  const { cartCount } = useCartStore();

  return (
    <Badge count={cartCount} showZero={false} offset={[-5, 5]}>
      <Button
        type="default"
        size="large"
        icon={<ShoppingCartOutlined className="text-xl" />}
        onClick={onClick}
        className="!border-apple-blue !text-apple-blue-light hover:!bg-apple-blue/10 !h-11 !px-4"
      />
    </Badge>
  );
}
