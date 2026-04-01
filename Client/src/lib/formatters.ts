/**
 * Shared formatting utilities — eliminates duplicate formatCurrency/formatDate
 * across OrdersClient, CategoriesPage, ProductsClient, and DashboardOverview.
 */

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};
