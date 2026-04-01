import { AppstoreAddOutlined, BarChartOutlined, ExclamationCircleOutlined, ShoppingCartOutlined, TagsOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { serverFetch } from '@/lib/serverFetch';
import { formatCurrency } from '@/lib/formatters';

dayjs.extend(relativeTime);

export default async function DashboardOverview() {
    const [summary, activities] = await Promise.all([
        serverFetch<any>('/dashboard/summary', { fallback: null }),
        serverFetch<any[]>('/activity-logs', { fallback: [] }),
    ]);

    const stats = [
        {
            title: 'Orders Today',
            value: summary?.totalOrdersToday ?? 0,
            icon: <ShoppingCartOutlined />,
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50 dark:bg-blue-500/10',
            textColor: 'text-blue-600 dark:text-blue-400',
            link: '/dashboard/orders',
        },
        {
            title: 'Completed vs Pending',
            value: `${summary?.completedOrders ?? 0} / ${summary?.pendingOrders ?? 0}`,
            icon: <AppstoreAddOutlined />,
            color: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50 dark:bg-purple-500/10',
            textColor: 'text-purple-600 dark:text-purple-400',
            link: '/dashboard/orders',
        },
        {
            title: 'Revenue Today',
            value: formatCurrency(summary?.revenueToday ?? 0),
            icon: <BarChartOutlined />,
            color: 'from-emerald-500 to-emerald-600',
            bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            link: '/dashboard/orders',
        },
        {
            title: 'Low Stock Alerts',
            value: summary?.lowStockCount ?? 0,
            icon: <ExclamationCircleOutlined />,
            color: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-500/10',
            textColor: 'text-orange-600 dark:text-orange-400',
            link: '/dashboard/restock',
        },
    ];

    return (
        <div className="bg-transparent text-gray-900 dark:text-gray-100 transition-colors">
            <div className="pt-6 md:pt-2">
                {/* Welcome Header */}
                <div className="mb-8 space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Dashboard Overview</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">
                        A quick glance at your daily inventory operations and system activity.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <Link href={stat.link} key={i} className="group">
                            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bgLight} transition-colors`}>
                                        <span className={`text-xl ${stat.textColor}`}>{stat.icon}</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-[#272877] dark:group-hover:text-[#6e6fe4] transition-colors">
                                        View →
                                    </span>
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 transition-colors">{stat.title}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Specific Product Health Summary */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-colors">
                        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100 dark:border-[#303030] transition-colors">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors">Specific Product Insights</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">Immediate stock availability constraints</p>
                        </div>
                        <div className="p-6">
                            {summary?.productSummaries?.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {summary.productSummaries.map((cat: any, i: number) => (
                                        <div key={i} className={`p-4 rounded-xl border transition-colors ${cat.healthStatus === 'High Priority' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' : cat.healthStatus === 'Medium Priority' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50' : cat.healthStatus === 'Low Priority' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50' : 'bg-gray-50 border-gray-100 dark:bg-[#1a1a1a] dark:border-[#303030]'}`}>
                                            <p className="font-semibold text-sm mb-2 dark:text-gray-200 group truncate" title={cat.productName}>{cat.productName}</p>
                                            <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span><strong className={`font-semibold ${cat.healthStatus === 'High Priority' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{cat.stockLeft}</strong> left</span>
                                                <span className={`${cat.healthStatus === 'High Priority' ? 'text-red-500 font-bold' : cat.healthStatus === 'Medium Priority' ? 'text-orange-500 font-bold' : cat.healthStatus === 'Low Priority' ? 'text-blue-500 font-bold' : 'text-green-500'}`}>{cat.healthStatus}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No product tracking available.</p>
                            )}
                        </div>
                    </div>

                    {/* Activity Log Widget */}
                    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-colors flex flex-col max-h-[400px]">
                        <div className="px-6 pt-7 pb-5 border-b border-gray-100 dark:border-[#303030] transition-colors flex items-center gap-2">
                            <ClockCircleOutlined className="text-[#272877] dark:text-[#6e6fe4]"/>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors">Activity Log</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">Recent system events</p>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {activities?.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map((act: any) => (
                                        <div key={act._id} className="relative pl-6 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-[-20px] before:w-[2px] before:bg-gray-200 dark:before:bg-[#303030] last:before:hidden">
                                            <div className="absolute left-0 top-1.5 w-[10px] h-[10px] rounded-full bg-[#272877] dark:bg-[#6e6fe4] border-[2px] border-white dark:border-[#141414]" />
                                            <p className="text-sm text-gray-800 dark:text-gray-200">{act.action}</p>
                                            <span className="text-xs text-gray-400">{dayjs(act.createdAt).fromNow()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-colors mt-8">
                    <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100 dark:border-[#303030] transition-colors">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors">Quick Actions</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">Navigate to common tasks</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-[#303030]">
                        {[
                            { title: 'Add Product', desc: 'Create a new product entry', href: '/dashboard/products', icon: <AppstoreAddOutlined /> },
                            { title: 'Categories', desc: 'Manage your product tags', href: '/dashboard/categories', icon: <TagsOutlined /> },
                            { title: 'Place Order', desc: 'Deduct stock instantly', href: '/dashboard/orders', icon: <ShoppingCartOutlined /> },
                            { title: 'Restock Queue', desc: 'Prioritize low inventory', href: '/dashboard/restock', icon: <ExclamationCircleOutlined /> },
                        ].map((action) => (
                            <Link
                                key={action.title}
                                href={action.href}
                                className="group flex items-center gap-4 px-6 sm:px-8 py-5 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
                            >
                                <div className="p-2.5 rounded-xl bg-[#272877]/5 dark:bg-[#6e6fe4]/10 text-[#272877] dark:text-[#6e6fe4] group-hover:bg-[#272877]/10 dark:group-hover:bg-[#6e6fe4]/20 transition-colors text-lg">
                                    {action.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#272877] dark:group-hover:text-[#6e6fe4] transition-colors">
                                        {action.title}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">{action.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
