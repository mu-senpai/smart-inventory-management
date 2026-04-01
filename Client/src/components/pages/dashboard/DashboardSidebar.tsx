'use client';

import Logo from '@/components/shared/Logo';
import { logout } from '@/redux/features/authSlice';
import {
    AppstoreOutlined,
    CarOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    LogoutOutlined,
    TagsOutlined,
    ShoppingCartOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

interface DashboardSidebarProps {
    collapsed: boolean;
    isMobile: boolean;
    onCollapse: () => void;
}

export default function DashboardSidebar({ collapsed, isMobile, onCollapse }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();

    const activeKey = useMemo(() => {
        if (pathname.includes('/dashboard/overview')) return 'overview';
        if (pathname.includes('/dashboard/categories')) return 'categories';
        if (pathname.includes('/dashboard/products')) return 'products';
        if (pathname.includes('/dashboard/orders')) return 'orders';
        if (pathname.includes('/dashboard/restock')) return 'restock';
        return 'overview';
    }, [pathname]);

    const selectedKeys = useMemo(() => [activeKey], [activeKey]);

    const menuItems: MenuProps['items'] = useMemo(() => [
        {
            type: 'group',
            label: <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-2">Main</span>,
            children: [
                {
                    key: 'overview',
                    icon: <AppstoreOutlined className="!text-xl" />,
                    label: <Link href="/dashboard/overview" className='font-semibold'>Dashboard</Link>,
                },
            ],
        },
        {
            type: 'group',
            label: <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-2">Inventory</span>,
            children: [
                {
                    key: 'categories',
                    icon: <TagsOutlined className="!text-xl" />,
                    label: <Link href="/dashboard/categories" className='font-semibold'>Categories</Link>,
                },
                {
                    key: 'products',
                    icon: <CarOutlined className="!text-xl" />,
                    label: <Link href="/dashboard/products" className='font-semibold'>Products</Link>,
                },
            ],
        },
        {
            type: 'group',
            label: <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-2">Sales & Restock</span>,
            children: [
                {
                    key: 'orders',
                    icon: <ShoppingCartOutlined className="!text-xl" />,
                    label: <Link href="/dashboard/orders" className='font-semibold'>Orders</Link>,
                },
                {
                    key: 'restock',
                    icon: <UnorderedListOutlined className="!text-xl" />,
                    label: <Link href="/dashboard/restock" className='font-semibold'>Restock Queue</Link>,
                },
            ],
        },
    ], []);

    const handleMenuClick = useCallback(() => {
        if (isMobile) {
            onCollapse();
        }
    }, [isMobile, onCollapse]);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(logout());
            // Clear HttpOnly cookie through proxy endpoint
            await fetch("/api/proxy/auth/logout", { method: "POST" });
            toast.success("Logged out successfully!");
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Fallback to push even if fetch fails
            router.push("/auth/login");
        }
    }, [dispatch, router]);

    const containerClasses = useMemo(() =>
        `bg-white dark:bg-[#141414] h-full transition-all duration-300 z-50 border-r border-gray-100/80 dark:border-white/10 ${isMobile
            ? `fixed left-0 top-0 h-screen shadow-xl ${collapsed ? '-translate-x-full' : 'translate-x-0'} w-60`
            : 'relative w-full'
        } flex flex-col`,
        [isMobile, collapsed]
    );

    return (
        <div className={containerClasses}>
            {/* Logo Section */}
            <div className="flex items-center justify-center relative mb-4">
                <div className={`flex items-center ${collapsed ? 'p-3' : 'p-6 pb-2'} gap-3 w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
                    <Link href="/dashboard/overview" className="flex items-center">
                        <Logo collapsed={collapsed && !isMobile} />
                    </Link>
                </div>
                {!isMobile && (
                    <button
                        onClick={onCollapse}
                        className="text-gray-400 dark:text-gray-500 hover:text-[#272877] dark:hover:text-[#6e6fe4] bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md transition-all px-1.5 py-1.5 rounded-full absolute -right-3 top-6 flex items-center justify-center z-10"
                    >
                        {collapsed ? (
                            <DoubleRightOutlined className="text-sm" />
                        ) : (
                            <DoubleLeftOutlined className="text-sm" />
                        )}
                    </button>
                )}
            </div>

            {/* Menu Section */}
            <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={menuItems}
                    theme="dark"
                    inlineCollapsed={collapsed && !isMobile}
                    className="!bg-white dark:!bg-[#141414] !border-none custom-menu h-full px-3 transition-colors duration-300"
                    onClick={handleMenuClick}
                />
            </div>

            {/* Logout Section */}
            <div className="p-2 flex-shrink-0">
                <div
                    className="flex items-center text-black dark:text-gray-300 hover:text-white cursor-pointer transition-colors p-3 hover:bg-[#272877] rounded-lg w-full"
                    onClick={handleLogout}
                >
                    <LogoutOutlined className="text-lg mr-3" />
                    {(!collapsed || isMobile) && <span>Log out</span>}
                </div>
            </div>
        </div>
    );
}
