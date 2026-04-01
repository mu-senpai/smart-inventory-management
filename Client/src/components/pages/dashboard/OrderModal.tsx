import { useGetProductsQuery } from '@/redux/api/productApi';
import { useCreateOrderMutation } from '@/redux/api/orderApi';
import { CreateOrderRequest } from '@/type/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from 'antd';
import React, { useEffect } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface OrderModalProps {
    open: boolean;
    onClose: () => void;
}

const orderSchema = z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    products: z.array(
        z.object({
            product: z.string().min(1, 'Select a product'),
            quantity: z.number().int().min(1, 'Quantity must be at least 1')
        })
    ).min(1, 'At least one product must be added to the order'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrderModal({ open, onClose }: OrderModalProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            customerName: '',
            products: [{ product: '', quantity: 1 }],
        },
        mode: 'onChange'
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'products',
    });

    // Fetch Products to populate the dropdown
    const { data: productsRes, isLoading: isProductsLoading } = useGetProductsQuery({ limit: 1000 });
    const productOptions = productsRes?.data?.filter(p => p.status === 'Active') || [];

    const [createOrder, { isLoading }] = useCreateOrderMutation();

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const onSubmit = async (values: OrderFormValues) => {
        try {
            const reqData: CreateOrderRequest = {
                customerName: values.customerName,
                products: values.products
            };

            const result = await createOrder(reqData).unwrap();
            if (result.success) {
                toast.success(result.message || 'Order placed successfully');
                onClose();
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to place order');
        }
    };

    return (
        <Modal
            title="Place New Order"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnHidden
            centered
            className="rounded-xl overflow-hidden shadow-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">

                {/* Customer Name */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Name</label>
                    <Controller
                        name="customerName"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="Enter full name"
                                className="w-full px-4 py-2 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#272877] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            />
                        )}
                    />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{String(errors.customerName.message)}</p>}
                </div>

                {/* Dynamic Products List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ordered Products</label>
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => append({ product: '', quantity: 1 })}
                        >
                            Add Item
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#303030] rounded-lg flex items-start gap-3 relative">
                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Product</label>
                                    <Controller
                                        name={`products.${index}.product`}
                                        control={control}
                                        render={({ field: selectField }) => (
                                            <select
                                                {...selectField}
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] rounded text-sm text-gray-900 dark:text-gray-100 focus:border-[#272877] outline-none h-[40px]"
                                                disabled={isProductsLoading}
                                            >
                                                <option value="" disabled hidden>Select Product</option>
                                                {productOptions.map((po: any) => (
                                                    <option key={po.id} value={po.id}>
                                                        {po.name} (Stock: {po.stockQuantity}) - ${po.price}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.products?.[index]?.product && <p className="text-red-500 text-[10px] mt-1">{String(errors.products[index]?.product?.message)}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Quantity</label>
                                    <Controller
                                        name={`products.${index}.quantity`}
                                        control={control}
                                        render={({ field: qtyField }) => (
                                            <input
                                                {...qtyField}
                                                type="number"
                                                min={1}
                                                onChange={e => qtyField.onChange(parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] rounded text-sm text-gray-900 dark:text-gray-100 focus:border-[#272877] outline-none"
                                            />
                                        )}
                                    />
                                    {errors.products?.[index]?.quantity && <p className="text-red-500 text-[10px] mt-1">{String(errors.products[index]?.quantity?.message)}</p>}
                                </div>
                            </div>

                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg absolute top-3 right-3 transition-colors"
                                >
                                    <DeleteOutlined />
                                </button>
                            )}
                        </div>
                    ))}
                    {errors.products && typeof errors.products.message === 'string' && (
                        <p className="text-red-500 text-xs mt-1">{errors.products.message}</p>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10 mt-6">
                    <Button onClick={onClose} className="rounded-lg h-10 px-6">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        disabled={!isValid}
                        className="bg-[#272877] hover:bg-[#272877]/90 h-10 px-6 rounded-lg font-medium border-none shadow-md hover:shadow-lg transition-all"
                    >
                        Confirm Order
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
