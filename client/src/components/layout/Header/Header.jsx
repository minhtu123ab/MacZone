import { Avatar, Dropdown, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  AppleOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../../store/useAuthStore";
import useCartStore from "../../../store/useCartStore";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchCartCount, resetCart } = useCartStore();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Fetch cart count on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    } else {
      resetCart();
    }
  }, [isAuthenticated, fetchCartCount, resetCart]);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (dropdownVisible) {
        setDropdownVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dropdownVisible]);

  const handleMenuClick = ({ key }) => {
    setDropdownVisible(false);

    switch (key) {
      case "profile":
        navigate("/profile");
        break;
      case "cart":
        navigate("/cart");
        break;
      case "orders":
        navigate("/orders");
        break;
      case "settings":
        console.log("Settings clicked");
        break;
      case "logout":
        logout();
        resetCart();
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "cart",
      icon: <ShoppingCartOutlined />,
      label: "My Cart",
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "My Orders",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <div className="absolute top-8 right-8 z-50">
      {isAuthenticated && user ? (
        <Dropdown
          open={dropdownVisible}
          onOpenChange={setDropdownVisible}
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          align={{ offset: [0, 8] }}
        >
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-full cursor-pointer hover:shadow-glow transition-all">
            <Avatar
              icon={<UserOutlined />}
              className="!bg-apple-blue"
              size="default"
            />
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">
                {user.full_name}
              </span>
              <span className="text-apple-gray text-xs">{user.email}</span>
            </div>
          </div>
        </Dropdown>
      ) : (
        <div className="flex gap-3">
          <Button
            type="default"
            onClick={() => navigate("/login")}
            className="!border-apple-blue !text-apple-blue-light hover:!bg-apple-blue/10"
            icon={<UserOutlined />}
          >
            Sign In
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/register")}
            className="glow"
            icon={<AppleOutlined />}
          >
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );
}
