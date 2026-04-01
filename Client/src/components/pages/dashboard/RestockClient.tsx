'use client';

import { useUpdateProductMutation } from '@/redux/api/productApi';
import { useGetRestockQueueQuery } from '@/redux/api/restockApi';
import { RestockQueueItem } from '@/type/type';
import {
    AppstoreOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, InputNumber, Popover, Tag } from 'antd';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RestockClient({ initialQueue }: { initialQueue?: RestockQueueItem[] }) {
    const { data: queueRes, isLoading } = useGetRestockQueueQuery();
    const [updateProduct] = useUpdateProductMutation();
    const [restockAmounts, setRestockAmounts] = useState<{ [key: string]: number }>({});
    const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});

    const resolvedQueue = queueRes?.data ?? initialQueue ?? [];

    // DEV ONLY: surface items with missing product IDs
    if (process.env.NODE_ENV === 'development') {
        resolvedQueue.forEach((item, i) => {
            if (!item.product?._id) {
                console.warn(`[RestockClient] item at index ${i} has no product.id`, item);
            }
        });
    }

    const handleAmountChange = (id: string, value: number | null) => {
        setRestockAmounts(prev => ({ ...prev, [id]: value || 0 }));
    };

    const handleRestock = async (item: RestockQueueItem) => {
        const addedQty = restockAmounts[item.product._id] || 0;
        if (addedQty <= 0) {
            toast.error('Please enter an amount greater than 0.');
            return;
        }

        setIsUpdating(prev => ({ ...prev, [item.product._id]: true }));
        try {
            const newTotal = item.product.stockQuantity + addedQty;
            const result = await updateProduct({
                id: item.product._id,
                data: { stockQuantity: newTotal },
            }).unwrap();

            if (result.success) {
                toast.success(`Restocked! New quantity for ${item.product.name} is ${newTotal}.`);
                setRestockAmounts(prev => {
                    const next = { ...prev };
                    delete next[item.product._id];
                    return next;
                });
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update stock');
        } finally {
            setIsUpdating(prev => ({ ...prev, [item.product._id]: false }));
        }
    };

    const getPriorityTag = (priority: string) => {
        switch (priority) {
            case 'High':
                return <Tag color="red" icon={<ExclamationCircleOutlined />}>High Priority</Tag>;
            case 'Medium':
                return <Tag color="orange">Medium Priority</Tag>;
            case 'Low':
                return <Tag color="blue">Low Priority</Tag>;
            default:
                return <Tag>{priority}</Tag>;
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
                                Restock Queue
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">
                                Prioritized list of inventory falling below the minimum threshold.
                                Computations are dynamically determined.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-[#141414] rounded-lg shadow-sm border border-gray-200 dark:border-[#303030] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-5xl xl:min-w-full divide-y divide-gray-200 dark:divide-[#303030]">
                            {/* Table Header */}
                            <thead className="bg-gray-50 dark:bg-[#1f1f1f] transition-colors">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Stock Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                                        Quick Restock
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white dark:bg-[#141414] divide-y divide-gray-200 dark:divide-[#303030] transition-colors">
                                {isLoading && (!resolvedQueue || resolvedQueue.length === 0) ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <td key={j} className="px-6 py-5">
                                                    <div className="h-4 bg-gray-200 dark:bg-[#303030] rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    // ✅ FIX: use index as fallback in case item.product.id is undefined/null
                                    resolvedQueue.map((item: RestockQueueItem, index: number) => (
                                        <tr
                                            key={item.product?._id ?? `restock-item-${index}`}
                                            className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
                                        >
                                            {/* Product Details */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                                                        {item.product.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <AppstoreOutlined className="mr-1" />
                                                        {item.product.category?.name || 'Uncategorized'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Priority */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPriorityTag(item.priority)}
                                            </td>

                                            {/* Stock Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-bold text-red-500">
                                                            {item.product.stockQuantity}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Current</span>
                                                    </div>
                                                    <span className="text-gray-300 dark:text-gray-600">/</span>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                            {item.product.minThreshold}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Min</span>
                                                    </div>
                                                    <Popover
                                                        content={
                                                            <span className="text-xs">
                                                                Missing {item.gap} units to reach threshold
                                                            </span>
                                                        }
                                                    >
                                                        <InfoCircleOutlined className="text-gray-400 ml-2 cursor-help" />
                                                    </Popover>
                                                </div>
                                            </td>

                                            {/* Quick Restock */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <InputNumber
                                                        min={1}
                                                        size="middle"
                                                        placeholder="Add Qty"
                                                        value={restockAmounts[item.product._id]}
                                                        onChange={val => handleAmountChange(item.product._id, val)}
                                                        className="w-[100px]"
                                                    />
                                                    <Button
                                                        type="primary"
                                                        size="middle"
                                                        icon={<PlusOutlined />}
                                                        disabled={
                                                            !restockAmounts[item.product._id] ||
                                                            restockAmounts[item.product._id] <= 0
                                                        }
                                                        loading={isUpdating[item.product._id]}
                                                        onClick={() => handleRestock(item)}
                                                        className="!bg-[#272877] !border-none hover:!bg-[#272877]/90"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {!isLoading && resolvedQueue.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                                <UnorderedListOutlined className="text-2xl text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                                Stock is healthy!
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                                Your entire inventory is safely above minimum thresholds.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
