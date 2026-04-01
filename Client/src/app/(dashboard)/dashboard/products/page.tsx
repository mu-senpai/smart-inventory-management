import ProductsClient from '@/components/pages/dashboard/ProductsClient';
import { serverFetch } from '@/lib/serverFetch';

export const metadata = {
    title: 'Products | Smart Inventory',
    description: 'Manage your product inventory',
};

export default async function ProductsPage() {
    const products = await serverFetch<any[]>('/products?page=1&limit=10', { fallback: [] });

    // Map backend shape to UI shape for SSR hydration
    const mappedData = (products || []).map((item: any) => {
        const gap = item.minThreshold - item.stockQuantity;
        const priority =
            item.stockQuantity === 0 ? "Critical" :
            gap >= 10 ? "High" :
            gap > 0 ? "Medium" : "Normal";

        const catIsObj = typeof item.category === "object" && item.category !== null;

        return {
            ...item,
            priority,
            category: catIsObj ? {
                id: item.category._id,
                name: item.category.name
            } : undefined
        };
    });

    return <ProductsClient initialProducts={mappedData} />;
}
