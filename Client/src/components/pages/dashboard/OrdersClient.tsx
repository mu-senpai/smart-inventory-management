'use client';

import TablePagination from '@/components/shared/TablePagination';
import { formatCurrency } from '@/lib/formatters';
import { useDeleteOrderMutation, useGetOrdersQuery, useUpdateOrderStatusMutation } from '@/redux/api/orderApi';
import { Order } from '@/type/type';
import { DeleteOutlined, FilterOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Popover, Select, Tag } from 'antd';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import OrderModal from './OrderModal';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const;

export default function OrdersClient({ initialOrders }: { initialOrders?: Order[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const { data: ordersResponse, isLoading } = useGetOrdersQuery({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
    });

    const [deleteOrder] = useDeleteOrderMutation();
    const [updateStatus] = useUpdateOrderStatusMutation();

    const isDefaultView = currentPage === 1 && !statusFilter;
    const resolvedOrders = ordersResponse?.data ?? (isDefaultView ? initialOrders ?? [] : []);
    const meta = ordersResponse?.meta;

    // DEV: surface orders with missing IDs before they crash the render
    if (process.env.NODE_ENV === 'development') {
        resolvedOrders.forEach((order, i) => {
            if (!order?._id) {
                console.warn(`[OrdersClient] order at index ${i} has no id`, order);
            }
        });
    }

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleOpenCreate = useCallback(() => setModalOpen(true), []);
    const handleCloseModal = useCallback(() => setModalOpen(false), []);

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteOrder(id).unwrap();
            if (result.success) {
                toast.success(result.message || 'Order deleted successfully!');
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to delete order.');
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const result = await updateStatus({ id, status: newStatus as any }).unwrap();
            if (result.success) {
                toast.success(`Order marked as ${newStatus}`);
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to update status.');
        }
    };

    const handleStatusFilter = (value: string | undefined) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'Pending':   return <Tag color="orange">Pending</Tag>;
            case 'Confirmed': return <Tag color="blue">Confirmed</Tag>;
            case 'Shipped':   return <Tag color="purple">Shipped</Tag>;
            case 'Delivered': return <Tag color="green">Delivered</Tag>;
            case 'Cancelled': return <Tag color="red">Cancelled</Tag>;
            default:          return <Tag>{status}</Tag>;
        }
    };

    return (
        <div className="bg-transparent text-gray-900 dark:text-gray-100 transition-colors">
            <div className="pt-6 md:pt-2">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
                                Orders
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">
                                Manage your customer orders and status workflows
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                placeholder="Filter by status"
                                allowClear
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                className="min-w-[160px]"
                                suffixIcon={<FilterOutlined />}
                                options={ORDER_STATUSES.map(s => ({ value: s, label: s }))}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleOpenCreate}
                                className="!bg-[#272877] !border-none hover:!bg-[#272877]/90 !h-10 !rounded-lg !font-medium shadow-sm"
                            >
                                Place Order
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-[#141414] rounded-lg shadow-sm border border-gray-200 dark:border-[#303030] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-5xl xl:min-w-full divide-y divide-gray-200 dark:divide-[#303030]">
                            <thead className="bg-gray-50 dark:bg-[#1f1f1f] transition-colors">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px]">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">Products</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">Total Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">Status Update</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">Action</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white dark:bg-[#141414] divide-y divide-gray-200 dark:divide-[#303030] transition-colors">
                                {isLoading && (!resolvedOrders || resolvedOrders.length === 0) ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-gray-200 dark:bg-[#303030] rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    resolvedOrders.map((order: Order, index: number) => (
                                        <tr
                                            key={order?._id ?? `order-${index}`}
                                            className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
                                        >
                                            {/* Order ID */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                                {/* ✅ FIX: optional chain + nullish fallback before calling .slice() */}
                                                #{(order?._id?.slice(-6) ?? '------').toUpperCase()}
                                            </td>

                                            {/* Customer Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                                                    {order.customerName}
                                                </div>
                                            </td>

                                            {/* Products Summary */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                <Popover
                                                    content={
                                                        <ul className="pl-4 m-0 space-y-1">
                                                            {order.products?.map((op, idx) => (
                                                                <li key={idx} className="text-sm list-disc">
                                                                    <span className="font-semibold">{op.product?.name}</span> x {op.quantity}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    }
                                                    title={`${order.products?.length ?? 0} Products Ordered`}
                                                    trigger="hover"
                                                >
                                                    <span className="cursor-help flex items-center gap-2">
                                                        <ShoppingCartOutlined className="text-gray-400" />
                                                        {order.products?.length ?? 0} Item(s)
                                                    </span>
                                                </Popover>
                                            </td>

                                            {/* Total Price */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#272877] dark:text-[#6e6fe4] transition-colors">
                                                {formatCurrency(order.totalPrice)}
                                            </td>

                                            {/* Status Update */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-1 items-center">
                                                    {getStatusTag(order.status)}
                                                    <Select
                                                        size="small"
                                                        value={order.status}
                                                        onChange={val => handleStatusUpdate(order._id, val)}
                                                        className="w-[120px] mt-1"
                                                        options={[
                                                            { value: 'Pending',   label: 'Pending' },
                                                            { value: 'Confirmed', label: 'Confirmed' },
                                                            { value: 'Shipped',   label: 'Shipped' },
                                                            { value: 'Delivered', label: 'Delivered' },
                                                            { value: 'Cancelled', label: 'Cancelled' },
                                                        ]}
                                                    />
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Popconfirm
                                                        title="Delete Order"
                                                        description="Are you sure? This will restore stock if order was uncompleted."
                                                        onConfirm={() => handleDelete(order._id)}
                                                        okText="Yes"
                                                        cancelText="No"
                                                        okButtonProps={{ className: '!bg-red-500 !border-none hover:!bg-red-600' }}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            size="small"
                                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                            title="Delete Order"
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {!isLoading && resolvedOrders.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-[#1a1a1a] mb-4">
                                <ShoppingCartOutlined className="text-2xl text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                                No orders yet
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                                Get started by placing your first customer order.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && meta && meta.total > pageSize && (
                    <div className="mt-6 flex justify-end">
                        <TablePagination
                            current={meta.page}
                            pageSize={pageSize}
                            total={meta.total}
                            onChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            <OrderModal open={modalOpen} onClose={handleCloseModal} />
        </div>
    );
}
