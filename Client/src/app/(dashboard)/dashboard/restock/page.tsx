import RestockClient from '@/components/pages/dashboard/RestockClient';
import { RestockQueueItem } from '@/type/type';
import { serverFetch } from '@/lib/serverFetch';

export const metadata = {
    title: 'Restock Queue | Smart Inventory',
    description: 'Prioritized list of products needing restock',
};

export default async function RestockPage() {
    const queue = await serverFetch<RestockQueueItem[]>('/restock/queue', { fallback: [] });
    return <RestockClient initialQueue={queue} />;
}
