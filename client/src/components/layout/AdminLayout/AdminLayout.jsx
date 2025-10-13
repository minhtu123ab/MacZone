import { useEffect, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Badge, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../../store/useAuthStore";
import { ROUTES } from "../../../constants";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dropdownVisible) {
        setDropdownVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dropdownVisible]);

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: "Products",
    },
    {
      key: "/admin/categories",
      icon: <AppstoreOutlined />,
      label: "Categories",
    },
    {
      key: "/admin/orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
    },
    {
      key: "/admin/reviews",
      icon: <StarOutlined />,
      label: "Reviews",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "My Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "home",
      label: "Go to Store",
      icon: <ShoppingOutlined />,
      onClick: () => navigate("/"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "linear-gradient(180deg, #0a1628 0%, #001529 100%)",
          zIndex: 100,
        }}
        width={250}
        breakpoint="lg"
        collapsedWidth={80}
      >
        <div
          style={{
            height: 80,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
          onClick={() => navigate(ROUTES.HOME)}
          className="cursor-pointer maczone-admin-logo-container"
        >
          {collapsed ? (
            <img
              src="/logo.svg"
              alt="MacZone"
              className="maczone-admin-logo"
              style={{
                width: 36,
                height: 36,
                filter: "drop-shadow(0 2px 8px rgba(24, 144, 255, 0.4))",
              }}
            />
          ) : (
            <>
              <img
                src="/logo-text.svg"
                alt="MacZone Admin"
                className="maczone-admin-logo"
                style={{
                  height: 50,
                  filter: "drop-shadow(0 2px 8px rgba(24, 144, 255, 0.3))",
                }}
              />
            </>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="maczone-admin-sidebar-menu"
          style={{
            background: "transparent",
            border: "none",
            padding: "0 12px",
          }}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "all 0.2s",
          minHeight: "100vh",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge count={0} showZero={false}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
              />
            </Badge>

            <Dropdown
              open={dropdownVisible}
              onOpenChange={setDropdownVisible}
              menu={{
                items: userMenuItems,
              }}
              placement="bottomRight"
              align={{ offset: [0, 8] }}
            >
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full cursor-pointer hover:shadow-glow transition-all min-w-52">
                <Avatar
                  icon={<CrownOutlined />}
                  style={{ backgroundColor: "#faad14" }}
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
          </div>
        </Header>
        <Content
          style={{
            margin: "24px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
