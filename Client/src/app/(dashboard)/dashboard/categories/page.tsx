'use client';

import CategoryModal from '@/components/pages/dashboard/CategoryModal';
import TablePagination from '@/components/shared/TablePagination';
import { formatDate } from '@/lib/formatters';
import { useDeleteCategoryMutation, useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { Category } from '@/type/type';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm } from 'antd';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export default function CategoriesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // RTK Query
    const { data: categoriesResponse, isLoading } = useGetCategoriesQuery({
        page: currentPage,
        limit: pageSize,
        searchTerm: searchTerm || undefined,
    });
    const [deleteCategory] = useDeleteCategoryMutation();

    const categories = categoriesResponse?.data ?? [];
    const meta = categoriesResponse?.meta;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenCreate = useCallback(() => {
        setEditingCategory(null);
        setModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((category: Category) => {
        setEditingCategory(category);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setEditingCategory(null);
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteCategory(id).unwrap();
            if (result.success) {
                toast.success(result.message || 'Category deleted successfully!');
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to delete category.');
        }
    };



    return (
        <div className="bg-transparent text-gray-900 dark:text-gray-100 transition-colors">
            <div className="pt-6 md:pt-2">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                        <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Categories</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">Manage your categories</p>
            </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleOpenCreate}
                            className="!bg-[#272877] !border-none hover:!bg-[#272877]/90 !h-10 !rounded-lg !font-medium"
                        >
                            Add Category
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md">
                        <Input
                            size="large"
                            placeholder="Search categories"
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="rounded-lg"
                            allowClear
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-[#141414] rounded-lg shadow-sm border border-gray-200 dark:border-[#303030] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-4xl xl:min-w-full divide-y divide-gray-200 dark:divide-[#303030] transition-colors">
                            {/* Table Header */}
                            <thead className="bg-gray-50 dark:bg-[#1f1f1f] transition-colors">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[280px]">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white dark:bg-[#141414] divide-y divide-gray-200 dark:divide-[#303030] transition-colors">
                                {isLoading ? (
                                    // Loading skeleton rows
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-gray-200 dark:bg-[#303030] rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                                            {/* Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                                                    {category.name}
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs transition-colors">
                                                    {category.description || '—'}
                                                </div>
                                            </td>

                                            {/* Created At */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                                {formatDate(category.createdAt)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Button
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        size="small"
                                                        className="text-gray-600 hover:text-blue-600"
                                                        title="Edit Category"
                                                        onClick={() => handleOpenEdit(category)}
                                                    />
                                                    <Popconfirm
                                                        title="Delete Category"
                                                        description="Are you sure you want to delete this category?"
                                                        onConfirm={() => handleDelete(category._id)}
                                                        okText="Yes"
                                                        cancelText="No"
                                                        okButtonProps={{
                                                            className: '!bg-red-500 !border-none hover:!bg-red-600',
                                                        }}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            size="small"
                                                            className="text-gray-600 hover:text-red-600"
                                                            title="Delete Category"
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
                    {!isLoading && categories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2 transition-colors">No categories found</div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm transition-colors">
                                {searchTerm
                                    ? `No results for "${searchTerm}"`
                                    : 'Create your first category to get started'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && meta && meta.total > pageSize && (
                    <div className="mt-6">
                        <TablePagination
                            current={meta.page}
                            pageSize={pageSize}
                            total={meta.total}
                            onChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Category Modal */}
            <CategoryModal
                open={modalOpen}
                editingCategory={editingCategory}
                onClose={handleCloseModal}
            />
        </div>
    );
}
