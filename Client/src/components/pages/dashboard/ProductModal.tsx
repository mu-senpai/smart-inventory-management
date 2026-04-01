'use client';

import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import {
    useCreateProductMutation,
    useUpdateProductMutation,
} from '@/redux/api/productApi';
import { UIProduct } from '@/services/apiAdapter';
import { Product } from '@/type/type';
import { CreateProductFormSchema } from '@/types/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, InputNumber, Modal, Select } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProductModalProps {
    open: boolean;
    editingProduct: UIProduct | null;
    onClose: () => void;
}

export default function ProductModal({ open, editingProduct, onClose }: ProductModalProps) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<any>({
        resolver: zodResolver(CreateProductFormSchema) as any,
        defaultValues: {
            name: '',
            category: '',
            price: 0,
            stockQuantity: 0,
            minThreshold: 10,
            description: '',
        }
    });

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const isEditing = !!editingProduct;
    const isSubmitting = isCreating || isUpdating;

    const [categorySearch, setCategorySearch] = useState('');
    const { data: categoriesResponse, isFetching: isCategoriesLoading } = useGetCategoriesQuery({
        limit: 20,
        searchTerm: categorySearch || undefined,
    });

    const categoryOptions = useMemo(() =>
        (categoriesResponse?.data ?? []).map((cat) => ({
            label: cat.name,
            value: cat._id,
        })),
        [categoriesResponse]
    );

    const handleCategorySearch = useCallback((value: string) => {
        setCategorySearch(value);
    }, []);

    useEffect(() => {
        if (open) {
            if (editingProduct) {
                reset({
                    name: editingProduct.name,
                    price: editingProduct.price,
                    stockQuantity: editingProduct.stockQuantity,
                    minThreshold: editingProduct.minThreshold,
                    description: editingProduct.description || '',
                    category: editingProduct.categoryId,
                });
            } else {
                reset({
                    name: '',
                    category: '',
                    price: 0,
                    stockQuantity: 0,
                    minThreshold: 10,
                    description: '',
                });
            }
            setCategorySearch('');
        }
    }, [open, editingProduct, reset]);

    const onSubmit = async (values: any) => {
        try {
            const payload = {
                ...values,
                price: Number(values.price),
                stockQuantity: Number(values.stockQuantity),
                minThreshold: Number(values.minThreshold),
                categoryId: values.category,
            };

            if (isEditing) {
                const result = await updateProduct({
                    id: editingProduct.id,
                    data: payload,
                }).unwrap();
                if (result.success) {
                    toast.success(result.message || 'Product updated successfully!');
                }
            } else {
                const result = await createProduct(payload).unwrap();
                if (result.success) {
                    toast.success(result.message || 'Product created successfully!');
                }
            }
            onClose();
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
        }
    };

    const inputClasses = "!py-1 !h-10 !rounded-lg !border-gray-300 dark:!border-[#303030] dark:!bg-[#1f1f1f] dark:!text-white transition-colors";
    const labelClasses = "text-gray-700 dark:text-gray-300 font-medium transition-colors mb-1 block";

    return (
        <Modal
            title={
                <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </span>
            }
            open={open}
            onCancel={onClose}
            onOk={handleSubmit(onSubmit)}
            okText={isEditing ? 'Update' : 'Create'}
            confirmLoading={isSubmitting}
            okButtonProps={{
                className: '!bg-[#272877] !border-none hover:!bg-[#272877]/90',
            }}
            centered
            destroyOnHidden
            width={640}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Name</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder="e.g. MacBook Pro" className={inputClasses} status={errors.name ? 'error' : ''} />
                            )}
                        />
                        {errors.name && <span className="text-red-500 text-xs mt-1 block">{String(errors.name.message)}</span>}
                    </div>

                    <div>
                        <label className={labelClasses}>Category</label>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    showSearch
                                    placeholder="Select a category"
                                    filterOption={false}
                                    onSearch={handleCategorySearch}
                                    loading={isCategoriesLoading}
                                    options={categoryOptions}
                                    className="!rounded-lg w-full"
                                    size="large"
                                    status={errors.category ? 'error' : ''}
                                />
                            )}
                        />
                        {errors.category && <span className="text-red-500 text-xs mt-1 block">{String(errors.category.message)}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Price</label>
                        <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    placeholder="e.g. 999.99"
                                    min={0}
                                    className={`${inputClasses} !w-full`}
                                    status={errors.price ? 'error' : ''}
                                />
                            )}
                        />
                        {errors.price && <span className="text-red-500 text-xs mt-1 block">{String(errors.price.message)}</span>}
                    </div>

                    <div>
                        <label className={labelClasses}>Current Stock</label>
                        <Controller
                            name="stockQuantity"
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    placeholder="e.g. 50"
                                    min={0}
                                    className={`${inputClasses} !w-full`}
                                    status={errors.stockQuantity ? 'error' : ''}
                                />
                            )}
                        />
                        {errors.stockQuantity && <span className="text-red-500 text-xs mt-1 block">{String(errors.stockQuantity.message)}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Low Stock Threshold</label>
                        <Controller
                            name="minThreshold"
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    placeholder="e.g. 10"
                                    min={0}
                                    className={`${inputClasses} !w-full`}
                                    status={errors.minThreshold ? 'error' : ''}
                                />
                            )}
                        />
                        {errors.minThreshold && <span className="text-red-500 text-xs mt-1 block">{String(errors.minThreshold.message)}</span>}
                    </div>

                    <div>
                        <label className={labelClasses}>Description (Optional)</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder="Product description" className={inputClasses} />
                            )}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
