# Smart Inventory & Order Management System — Frontend

A modern, production-ready frontend for managing products, stock levels, customer orders, and fulfillment workflows. Built with **Next.js 16**, **TypeScript**, **Redux Toolkit (RTK Query)**, and **Ant Design**.

## 🚀 Features

### Authentication
- Email + Password login & signup
- Demo Login button with pre-filled credentials
- Secure HttpOnly cookie-based session management via BFF proxy
- Auto-redirect to Dashboard on successful login

### Product & Category Management
- Full CRUD for products and categories
- Products include: Name, Category, Price, Stock Quantity, Minimum Threshold, Status
- Auto-computed stock priority (Critical / High / Medium / Normal)
- Server-side pagination and search

### Order Management
- Create orders with multiple products and quantities
- Auto-calculated total price
- Status workflow: Pending → Confirmed → Shipped → Delivered
- Cancel/delete orders with automatic stock restoration
- Filter orders by status
- Conflict detection: duplicate products, inactive products, insufficient stock

### Stock Handling
- Automatic stock deduction on order placement
- Insufficient stock warnings with exact availability
- Auto Out-of-Stock status when stock reaches 0
- Auto-reactivation when stock is restored

### Restock Queue
- Automatic low-stock detection (below minimum threshold)
- Priority-based queue (High / Medium / Low)
- Manual restock with inline editing
- Sorted by lowest stock first

### Dashboard Overview
- Orders Today, Pending vs Completed, Revenue Today, Low Stock Alerts
- Product health summary with visual status indicators
- Activity log with real-time system events
- Quick action navigation links

### Activity Log
- Tracks latest 10 system actions
- Relative timestamps (e.g., "5 minutes ago")
- Auto-cleanup of old entries

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router, Server Components |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Redux Toolkit + RTK Query](https://redux-toolkit.js.org/) | State management and API caching |
| [Ant Design](https://ant.design/) | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Zod](https://zod.dev/) | Runtime schema validation |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode theming |

## 📁 Project Structure

```
Client/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/              # Auth route group (login, signup)
│   │   ├── (dashboard)/         # Dashboard route group
│   │   │   └── dashboard/
│   │   │       ├── overview/    # Dashboard home
│   │   │       ├── products/    # Product management
│   │   │       ├── categories/  # Category management
│   │   │       ├── orders/      # Order management
│   │   │       └── restock/     # Restock queue
│   │   └── api/proxy/           # BFF proxy route handler
│   ├── components/
│   │   ├── pages/auth/          # Auth form components
│   │   ├── pages/dashboard/     # Dashboard page components
│   │   └── shared/              # Reusable UI components
│   ├── lib/                     # Shared utilities
│   │   ├── serverFetch.ts       # SSR fetch helper
│   │   └── formatters.ts        # Currency/date formatters
│   ├── redux/
│   │   ├── api/                 # RTK Query API slices
│   │   ├── features/            # Redux state slices
│   │   └── store.ts             # Store configuration
│   ├── services/                # API adapters and transforms
│   ├── type/                    # TypeScript type definitions
│   └── types/                   # Zod schemas
```

## 🏗 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/smart-inventory-management.git
cd smart-inventory-management/Client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your backend URL
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL | `https://smart-inventory-server.vercel.app/api/v1` |

### Development

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🔐 Authentication Architecture

This app uses a **BFF (Backend for Frontend) proxy pattern** instead of the deprecated Next.js 14 `middleware.ts`:

1. All API calls go through `/api/proxy/[...path]` route handler
2. On login/signup, the proxy intercepts the response and sets the JWT as a **secure HttpOnly cookie**
3. On subsequent requests, the proxy reads the cookie and forwards the token as an `Authorization` header
4. The client never has direct access to the raw JWT — enhancing security
5. Logout clears the HttpOnly cookie via the proxy

## 🧪 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `123456` |
| Demo | `demo@inventory.com` | `Demo@1234` |
| Manager | `manager@smartinventory.com` | `123456` |

## 📡 API Integration

All API calls are managed through **RTK Query** with automatic caching, invalidation, and optimistic updates:

- `authApi` — Login, signup, demo-login, getMe
- `productApi` — Products CRUD with pagination
- `categoryApi` — Categories CRUD with pagination
- `orderApi` — Orders CRUD with status filtering
- `restockApi` — Restock queue fetching
- `dashboardApi` — Dashboard summary & activity logs

## 🌙 Theming

Supports **dark mode** and **light mode** via `next-themes`. Toggle is available in the dashboard navbar.

## 📦 Deployment

Optimized for deployment on **Vercel**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set `NEXT_PUBLIC_BASE_URL` in your Vercel project environment variables.

## 📄 License

This project is for demonstration and educational purposes.
