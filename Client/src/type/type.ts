// ── Shared Types ──────────────────────────────────────────────

export interface Meta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
}

// ── Auth Types ────────────────────────────────────────────────

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    role?: 'Admin' | 'Manager';
}

export interface AuthUser {
    _id: string;
    email: string;
    role: 'Admin' | 'Manager';
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    message: string;
    success: boolean;
    data: {
        user: AuthUser;
        token: string;
    };
}

export interface SignupResponse {
    message: string;
    success: boolean;
    data: {
        user: AuthUser;
    };
}

export interface GetMeResponse {
    success: boolean;
    data: AuthUser;
}

// ── Category Types ────────────────────────────────────────────

export interface Category {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetCategoriesParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
}

export interface GetCategoriesResponse {
    message: string;
    success: boolean;
    meta: Meta;
    data: Category[];
}

export interface SingleCategoryResponse {
    message: string;
    success: boolean;
    meta: unknown;
    data: Category;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    id: string;
    data: {
        name?: string;
        description?: string;
    };
}

// ── Order Types ───────────────────────────────────────────────

export interface OrderProduct {
    product: Product;
    quantity: number;
}

export interface Order {
    _id: string; // mapped from _id
    customerName: string;
    products: OrderProduct[];
    totalPrice: number;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface GetOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
    searchTerm?: string;
}

export interface GetOrdersResponse {
    message: string;
    success: boolean;
    meta: Meta;
    data: Order[];
}

export interface SingleOrderResponse {
    message: string;
    success: boolean;
    meta: unknown;
    data: Order;
}

export interface CreateOrderRequest {
    customerName: string;
    products: { product: string; quantity: number }[];
}

export interface UpdateOrderStatusRequest {
    id: string;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}

// ── Product Types ─────────────────────────────────────────────

export interface Product {
    _id: string;
    name: string;
    price: number;
    stockQuantity: number;
    minThreshold: number;
    description?: string;
    status: string;
    categoryId: string;
    category?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    priority?: string; // UI added
}

export interface GetProductsParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
}

export interface GetProductsResponse {
    message: string;
    success: boolean;
    meta: Meta;
    data: Product[];
}

export interface SingleProductResponse {
    message: string;
    success: boolean;
    meta: unknown;
    data: Product;
}

export interface CreateProductRequest {
    name: string;
    price: number;
    stockQuantity: number;
    minThreshold: number;
    description?: string;
    categoryId: string;
}

export interface UpdateProductRequest {
    id: string;
    data: Partial<CreateProductRequest>;
}

// ── Restock Queue Types ──────────────────────────────────────────────

export interface RestockQueueItem {
    product: Product;
    gap: number;
    priority: 'High' | 'Medium' | 'Low';
}

export interface GetRestockQueueResponse {
    message: string;
    success: boolean;
    data: RestockQueueItem[];
}

// ── Activity Log Types ──────────────────────────────────────────────

export interface ActivityLog {
    _id: string; // mapped from _id
    action: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetActivityLogsResponse {
    message: string;
    success: boolean;
    data: ActivityLog[];
}

// ── Analytics Types ──────────────────────────────────────────

export interface DashboardProductSummary {
    productName: string;
    stockLeft: number;
    healthStatus: string;
}

export interface DashboardSummary {
    totalOrdersToday: number;
    pendingOrders: number;
    completedOrders: number;
    revenueToday: number;
    lowStockCount: number;
    productSummaries: DashboardProductSummary[];
}

export interface DashboardSummaryResponse {
    message: string;
    success: boolean;
    data: DashboardSummary;
}
