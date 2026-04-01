import ProductsClient from '@/components/pages/dashboard/ProductsClient';
import { ApiAdapter } from '@/services/apiAdapter';
import { serverFetch } from '@/lib/serverFetch';

export const metadata = {
    title: 'Products | Smart Inventory',
    description: 'Manage your product inventory',
};

export default async function ProductsPage() {
    const products = await serverFetch<any[]>('/products?page=1&limit=10', { fallback: [] });

    // ✅ Use the core adapter to ensure SSR data matches Client data exactly
    const mappedData = ApiAdapter.adaptProductList(products);

    return <ProductsClient initialProducts={mappedData} />;
}
