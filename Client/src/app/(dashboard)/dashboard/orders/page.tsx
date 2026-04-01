import OrdersClient from '@/components/pages/dashboard/OrdersClient';
import { Order } from '@/type/type';
import { serverFetch } from '@/lib/serverFetch';

export const metadata = {
    title: 'Orders | Smart Inventory',
    description: 'Manage your incoming orders and fulfillment',
};

export default async function OrdersPage() {
    const orders = await serverFetch<Order[]>('/orders?page=1&limit=10', { fallback: [] });
    return <OrdersClient initialOrders={orders} />;
}
