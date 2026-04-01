'use client';

import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen py-10 md:py-14 lg:py-20 2xl:py-10 flex flex-col items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300 relative">

      {/* Absolute Theme Toggle at Top Right */}
      {mounted && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
          <Button
            type="text"
            icon={theme === "dark" ? <SunOutlined className="text-yellow-400 text-lg" /> : <MoonOutlined className="text-gray-500 text-lg" />}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="!w-12 !h-12 !flex !items-center !justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#1f1f1f] bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-gray-200/50 dark:border-white/10 transition-all"
          />
        </div>
      )}

      {children}
    </div>
  );
}
