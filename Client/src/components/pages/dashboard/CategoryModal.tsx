'use client';

import {
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
} from '@/redux/api/categoryApi';
import { Category } from '@/type/type';
import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface CategoryModalProps {
    open: boolean;
    editingCategory: Category | null;
    onClose: () => void;
}

export default function CategoryModal({ open, editingCategory, onClose }: CategoryModalProps) {
    const [form] = Form.useForm();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const isEditing = !!editingCategory;
    const isSubmitting = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (editingCategory) {
                form.setFieldsValue({
                    name: editingCategory.name,
                    description: editingCategory.description,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingCategory, form]);

    const handleSubmit = async (values: { name: string; description?: string }) => {
        try {
            if (isEditing) {
                const result = await updateCategory({
                    id: editingCategory!._id,
                    data: values,
                }).unwrap();
                if (result.success) {
                    toast.success(result.message || 'Category updated successfully!');
                }
            } else {
                const result = await createCategory(values).unwrap();
                if (result.success) {
                    toast.success(result.message || 'Category created successfully!');
                }
            }
            onClose();
            form.resetFields();
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} category.`);
        }
    };

    return (
        <Modal
            title={
                <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                    {isEditing ? 'Edit Category' : 'Add New Category'}
                </span>
            }
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={isEditing ? 'Update' : 'Create'}
            confirmLoading={isSubmitting}
            okButtonProps={{
                className: '!bg-[#272877] !border-none hover:!bg-[#272877]/90',
            }}
            centered
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                className="mt-4"
            >
                <Form.Item
                    label={<span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Name</span>}
                    name="name"
                    rules={[{ required: true, message: 'Please enter a category name' }]}
                >
                    <Input
                        placeholder="e.g. Electronics"
                        className="!py-2.5 !px-4 !rounded-lg !border-gray-300 dark:!border-[#303030] dark:!bg-[#1f1f1f] dark:!text-white transition-colors"
                    />
                </Form.Item>

                <Form.Item
                    label={<span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Description</span>}
                    name="description"
                >
                    <Input.TextArea
                        placeholder="Brief description of this category..."
                        rows={3}
                        className="!py-2.5 !px-4 !rounded-lg !border-gray-300 dark:!border-[#303030] dark:!bg-[#1f1f1f] dark:!text-white transition-colors"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
