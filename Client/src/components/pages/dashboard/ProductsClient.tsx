'use client';

import ProductModal from '@/components/pages/dashboard/ProductModal';
import TablePagination from '@/components/shared/TablePagination';
import { formatCurrency } from '@/lib/formatters';
import { useDeleteProductMutation, useGetProductsQuery } from '@/redux/api/productApi';
import { UIProduct } from '@/services/apiAdapter';
import { Product } from '@/type/type';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm } from 'antd';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export default function ProductsClient({ initialProducts }: { initialProducts?: UIProduct[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<UIProduct | null>(null);

    // RTK Query
    const { data: productsResponse, isLoading } = useGetProductsQuery({
        page: currentPage,
        limit: pageSize,
        searchTerm: searchTerm || undefined,
    });
    const [deleteProduct] = useDeleteProductMutation();

    // If query hasn't resolved, fallback to SSR data if looking at page 1 with no search
    const isDefaultView = currentPage === 1 && !searchTerm;
    const resolvedProducts = productsResponse?.data ?? (isDefaultView ? initialProducts ?? [] : []);
    const meta = productsResponse?.meta;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenCreate = useCallback(() => {
        setEditingProduct(null);
        setModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((product: UIProduct) => {
        setEditingProduct(product);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setEditingProduct(null);
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteProduct(id).unwrap();
            if (result.success) {
                toast.success(result.message || 'Product deleted successfully!');
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to delete product.');
        }
    };



    return (
        <div className="bg-transparent text-gray-900 dark:text-gray-100 transition-colors">
            <div className="pt-6 md:pt-2">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Products</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">Manage your products</p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleOpenCreate}
                            className="!bg-[#272877] !border-none hover:!bg-[#272877]/90 !h-10 !rounded-lg !font-medium"
                        >
                            Add Product
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md">
                        <Input
                            size="large"
                            placeholder="Search products"
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
                        <table className="min-w-5xl xl:min-w-full divide-y divide-gray-200 dark:divide-[#303030]">
                            {/* Table Header */}
                            <thead className="bg-gray-50 dark:bg-[#1f1f1f] transition-colors">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                                        Product ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Restock Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white dark:bg-[#141414] divide-y divide-gray-200 dark:divide-[#303030] transition-colors">
                                {isLoading && (!resolvedProducts || resolvedProducts.length === 0) ? (
                                    // Loading skeleton rows
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 8 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-gray-200 dark:bg-[#303030] rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    resolvedProducts.map((product: UIProduct) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                                            {/* Product ID */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                                #{(product?.id?.slice(-6) ?? '------').toUpperCase()}
                                            </td>

                                            {/* Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                                                    {product.name}
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 transition-colors">
                                                    {product.categoryName || '—'}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white transition-colors">
                                                {formatCurrency(product.price)}
                                            </td>

                                            {/* Stock */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    product.stockQuantity > product.minThreshold
                                                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                                        : product.stockQuantity > 0
                                                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                                                }`}>
                                                    {product.stockQuantity}
                                                </span>
                                            </td>

                                            {/* Priority Tag */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    product.priority === 'High'
                                                        ? 'bg-red-600 text-white'
                                                        : product.priority === 'Medium'
                                                        ? 'bg-orange-400 text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                    {product.priority || 'Normal'}
                                                </span>
                                            </td>

                                            {/* Status Tag */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    product.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                }`}>
                                                    {product.status === 'OutOfStock' ? 'Out of Stock' : product.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Button
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        size="small"
                                                        className="text-gray-600 hover:text-blue-600"
                                                        title="Edit Product"
                                                        onClick={() => handleOpenEdit(product)}
                                                    />
                                                    <Popconfirm
                                                        title="Delete Product"
                                                        description="Are you sure you want to delete this product?"
                                                        onConfirm={() => handleDelete(product.id)}
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
                                                            title="Delete Product"
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
                    {!isLoading && resolvedProducts.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2 transition-colors">No products found</div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm transition-colors">
                                {searchTerm
                                    ? `No results for "${searchTerm}"`
                                    : 'Create your first product to get started'}
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

            {/* Product Modal */}
            <ProductModal
                open={modalOpen}
                editingProduct={editingProduct}
                onClose={handleCloseModal}
            />
        </div>
    );
}
