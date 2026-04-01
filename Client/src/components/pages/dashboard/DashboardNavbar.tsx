"use client";

import { logout } from "@/redux/features/authSlice";
import { RootState } from "@/redux/store";
import { MenuOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown } from "antd";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface DashboardNavbarProps {
  isMobile: boolean;
  onToggle: () => void;
}

export default function DashboardNavbar({
  isMobile,
  onToggle,
}: DashboardNavbarProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "logout",
        label: "Logout",
        danger: true,
      },
    ],
    [],
  );

  const handleMenuClick = useCallback(
    async (menuInfo: { key: string }) => {
      const { key } = menuInfo;

      if (key === "logout") {
        try {
          dispatch(logout());
          // Clear HttpOnly cookie through proxy endpoint
          await fetch("/api/proxy/auth/logout", { method: "POST" });
          toast.success("Logged out successfully!");
          router.push("/auth/login");
        } catch (error) {
          console.error("Logout failed:", error);
          router.push("/auth/login");
        }
      }
    },
    [dispatch, router],
  );

  const dropdownMenu = useMemo(
    () => ({
      items: userMenuItems,
      onClick: handleMenuClick,
    }),
    [userMenuItems, handleMenuClick],
  );

  const displayName = user?.email?.split('@')[0] || "Admin";
  const userRole = user?.role || "Admin";

  return (
    <div className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] px-4 md:px-6 h-20 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100/50 dark:border-white/10 transition-colors duration-300">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onToggle}
            className="!w-10 !h-10 !flex !items-center !justify-center"
          />
        )}

        {/* Welcome Message */}
        <h2 className="text-lg md:text-xl text-gray-800 dark:text-gray-100 font-medium tracking-tight transition-colors">
          <span className="text-gray-500 dark:text-gray-400 font-normal">Welcome </span>
          <span className="hidden sm:inline text-gray-500 dark:text-gray-400 font-normal">Back, </span>
          <span className="text-[#272877] dark:text-[#6e6fe4] font-semibold">{displayName}!</span>
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {mounted && (
          <Button
            type="text"
            icon={theme === "dark" ? <SunOutlined className="text-yellow-400" /> : <MoonOutlined className="text-gray-500" />}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="!w-10 !h-10 !flex !items-center !justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          />
        )}

      {/* User Profile */}
      <Dropdown menu={dropdownMenu} trigger={["click"]} placement="bottomRight">
        <div className="flex items-center !space-x-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1f1f1f] p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
          <Avatar
            size={42}
            className="shadow-sm !bg-gradient-to-tr !from-[#272877] !to-[#4143a3] font-semibold"
            icon={<UserOutlined />}
          />
          <div className="hidden sm:block pr-1">
            <div className="text-gray-800 dark:text-gray-100 font-semibold text-sm transition-colors">{displayName}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium -mt-0.5 transition-colors">{userRole}</div>
          </div>
        </div>
      </Dropdown>
      </div>
    </div>
  );
}
