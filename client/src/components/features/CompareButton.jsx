import { Checkbox, Tooltip } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import useCompareStore from "../../store/useCompareStore";

export default function CompareButton({ product, variant = "checkbox" }) {
  const { isInCompare, toggleCompare } = useCompareStore();
  const isSelected = isInCompare(product._id);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent parent click events
    e.preventDefault();
    toggleCompare(product);
  };

  if (variant === "checkbox") {
    return (
      <Tooltip
        title={isSelected ? "Remove from comparison" : "Add to comparison"}
      >
        <Checkbox
          checked={isSelected}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-gray-300 text-sm">Compare</span>
        </Checkbox>
      </Tooltip>
    );
  }

  // Button variant
  return (
    <Tooltip
      title={isSelected ? "Remove from comparison" : "Add to comparison"}
    >
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          isSelected
            ? "bg-apple-blue text-white ring-2 ring-apple-blue/50"
            : "glass border border-white/20 text-gray-300 hover:border-apple-blue/50"
        }`}
      >
        <SwapOutlined className="text-base" />
        <span className="text-sm font-medium">
          {isSelected ? "Remove Compare" : "Compare"}
        </span>
      </button>
    </Tooltip>
  );
}
