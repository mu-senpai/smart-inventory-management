# Smart Inventory & Order Management System — Backend API

A production-ready, modular REST API built with **TypeScript**, **Express.js**, **MongoDB (Mongoose)**, and **Zod** validation. Designed for managing products, categories, orders, stock levels, and restock priorities.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [package.json](#packagejson)
- [API Documentation](#api-documentation)
  - [Auth](#1-auth)
  - [User](#2-user)
  - [Categories](#3-categories)
  - [Products](#4-products)
  - [Orders](#5-orders)
  - [Restock Queue](#6-restock-queue)
  - [Dashboard](#7-dashboard)
  - [Activity Logs](#8-activity-logs)
- [Business Rules](#business-rules)
- [Testing](#testing)
- [Error Response Format](#error-response-format)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Type-safe codebase |
| Express.js | HTTP server & routing |
| MongoDB + Mongoose | Database & ODM |
| Zod | Request validation |
| bcrypt | Password hashing |
| jsonwebtoken | JWT authentication |
| Morgan | Request logging |
| Jest + Supertest | Automated testing |
| mongodb-memory-server | In-memory DB for tests |

---

## Folder Structure

```
Server/
├── .env                           # Environment variables (local)
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.ts
├── README.md
├── src/
│   ├── app.ts                     # Express app (middleware + routes)
│   ├── server.ts                  # Entry point (DB connect + listen)
│   ├── config/
│   │   ├── db.ts                  # Mongoose connection
│   │   └── env.ts                 # Validated env vars
│   ├── middleware/
│   │   ├── authenticate.ts        # JWT guard
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── requestLogger.ts       # Morgan logger
│   │   └── activityLogger.ts      # Auto-log system actions (capped at 10)
│   ├── utils/
│   │   ├── ApiError.ts            # Custom error class
│   │   ├── asyncHandler.ts        # Async try/catch wrapper
│   │   └── constants.ts           # Enums (UserRole, ProductStatus, etc.)
│   └── api/v1/
│       ├── index.ts               # V1 router aggregator
│       ├── auth/                  # Signup, Login, Demo Login
│       ├── user/                  # Profile management
│       ├── category/              # CRUD
│       ├── product/               # CRUD + low-stock
│       ├── order/                 # CRUD + stock deduction
│       ├── restock/               # Computed priority queue
│       ├── activity-log/          # Latest 10 system actions
│       └── dashboard/             # Aggregation pipelines
└── tests/
    ├── setup.ts                   # In-memory MongoDB setup
    ├── teardown.ts                # Cleanup
    ├── auth.test.ts
    ├── product.test.ts
    └── order.test.ts
```

Each module follows: **model → validation → service → controller → route**

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (or a MongoDB Atlas URI)

### Installation

```bash
# Clone the repo and navigate to the Server directory
cd Server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

The server starts at **http://localhost:5000**.
Health check: `GET http://localhost:5000/health`

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/smart-inventory` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for JWT signing (**required**) |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry duration |
| `DEMO_EMAIL` | `demo@inventory.com` | Email for the demo login endpoint |
| `DEMO_PASSWORD` | `Demo@1234` | Password for the demo login endpoint |

---

## Scripts

```bash
npm run dev      # Start dev server with hot-reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled production build
npm test         # Run Jest tests (uses in-memory MongoDB)
```

---

## package.json

```json
{
  "name": "smart-inventory-server",
  "version": "1.0.0",
  "description": "Smart Inventory & Order Management System — Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/server.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/server.js",
    "test": "jest --forceExit --detectOpenHandles"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "http-status-codes": "^2.3.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.9.5",
    "morgan": "^1.10.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.14",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/morgan": "^1.9.9",
    "@types/node": "^22.10.5",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^10.4.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-node-dev": "^2.0.0",
    "tsc-alias": "^1.8.10",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3"
  }
}
```

---

## API Documentation

**Base URL:** `http://localhost:5000/api/v1`

> All **protected** endpoints require the `Authorization: Bearer <token>` header.

---

### 1. Auth

Auth endpoints are **public** — no token required.

---

#### POST `/auth/signup`

Register a new user.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@company.com",
    password: "SecurePass123",
    role: "Admin" // optional, defaults to "Manager". Values: "Admin" | "Manager"
  })
});
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Min 6 characters |
| `role` | string | ❌ | `"Admin"` or `"Manager"` (default) |

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "661f1a2b3c4d5e6f7a8b9c0d",
      "email": "admin@company.com",
      "role": "Admin",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (409):**

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

#### POST `/auth/login`

Login with existing credentials.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@company.com",
    password: "SecurePass123"
  })
});
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ✅ | Registered email |
| `password` | string | ✅ | Account password |

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "661f1a2b3c4d5e6f7a8b9c0d",
      "email": "admin@company.com",
      "role": "Admin",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### POST `/auth/demo-login`

Login instantly with pre-configured demo credentials. Creates the demo user automatically on first call.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/auth/demo-login", {
  method: "POST",
  headers: { "Content-Type": "application/json" }
});
```

**Request Body:** None

**Response (200):**

```json
{
  "success": true,
  "message": "Demo login successful",
  "data": {
    "user": {
      "_id": "661f1a2b3c4d5e6f7a8b9c0e",
      "email": "demo@inventory.com",
      "role": "Admin",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. User

> 🔒 All User endpoints require authentication.

---

#### GET `/users/me`

Get the currently authenticated user's profile.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/users/me", {
  method: "GET",
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "661f1a2b3c4d5e6f7a8b9c0d",
    "email": "admin@company.com",
    "role": "Admin",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:00:00.000Z"
  }
}
```

---

#### PATCH `/users/me`

Update the current user's email or password.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/users/me", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    email: "newemail@company.com",
    password: "NewSecurePass456"
  })
});
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ❌ | New email address |
| `password` | string | ❌ | New password (min 6 chars) |

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "661f1a2b3c4d5e6f7a8b9c0d",
    "email": "newemail@company.com",
    "role": "Admin",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:05:00.000Z"
  }
}
```

---

### 3. Categories

> 🔒 All Category endpoints require authentication.

---

#### GET `/categories`

List all categories sorted by name.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/categories", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "661f1b2c3d4e5f6a7b8c9d0e",
      "name": "Electronics",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    },
    {
      "_id": "661f1b2c3d4e5f6a7b8c9d0f",
      "name": "Furniture",
      "createdAt": "2026-03-31T16:01:00.000Z",
      "updatedAt": "2026-03-31T16:01:00.000Z"
    }
  ]
}
```

---

#### GET `/categories/:id`

Get a single category by ID.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/categories/661f1b2c3d4e5f6a7b8c9d0e", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "661f1b2c3d4e5f6a7b8c9d0e",
    "name": "Electronics",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:00:00.000Z"
  }
}
```

---

#### POST `/categories`

Create a new category.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/categories", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    name: "Electronics"
  })
});
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Category name (must be unique) |

**Response (201):**

```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "_id": "661f1b2c3d4e5f6a7b8c9d0e",
    "name": "Electronics",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:00:00.000Z"
  }
}
```

---

#### PATCH `/categories/:id`

Update a category.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/categories/661f1b2c3d4e5f6a7b8c9d0e", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    name: "Consumer Electronics"
  })
});
```

**Response (200):**

```json
{
  "success": true,
  "message": "Category updated",
  "data": {
    "_id": "661f1b2c3d4e5f6a7b8c9d0e",
    "name": "Consumer Electronics",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:10:00.000Z"
  }
}
```

---

#### DELETE `/categories/:id`

Delete a category.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/categories/661f1b2c3d4e5f6a7b8c9d0e", {
  method: "DELETE",
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "message": "Category deleted"
}
```

---

### 4. Products

> 🔒 All Product endpoints require authentication.

---

#### GET `/products`

List all products (populated with category name).

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/products", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "661f1c3d4e5f6a7b8c9d0e1f",
      "name": "MacBook Pro 16\"",
      "category": {
        "_id": "661f1b2c3d4e5f6a7b8c9d0e",
        "name": "Electronics"
      },
      "price": 2499.99,
      "stockQuantity": 45,
      "minThreshold": 10,
      "description": "Apple MacBook Pro with M3 chip",
      "status": "Active",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    }
  ]
}
```

---

#### GET `/products/:id`

Get a single product by ID.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/products/661f1c3d4e5f6a7b8c9d0e1f", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "661f1c3d4e5f6a7b8c9d0e1f",
    "name": "MacBook Pro 16\"",
    "category": {
      "_id": "661f1b2c3d4e5f6a7b8c9d0e",
      "name": "Electronics"
    },
    "price": 2499.99,
    "stockQuantity": 45,
    "minThreshold": 10,
    "description": "Apple MacBook Pro with M3 chip",
    "status": "Active",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:00:00.000Z"
  }
}
```

---

#### POST `/products`

Create a new product.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    name: "MacBook Pro 16\"",
    category: "661f1b2c3d4e5f6a7b8c9d0e",
    price: 2499.99,
    stockQuantity: 45,
    minThreshold: 10,
    description: "Apple MacBook Pro with M3 chip"
  })
});
```

**Request Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | ✅ | — | Product name |
| `category` | string | ✅ | — | Category ObjectId |
| `price` | number | ✅ | — | Price (≥ 0) |
| `stockQuantity` | number | ✅ | `0` | Current stock (≥ 0) |
| `minThreshold` | number | ❌ | `10` | Low-stock threshold |
| `description` | string | ❌ | `""` | Product description |
| `status` | string | ❌ | `"Active"` | `"Active"` or `"OutOfStock"` |

**Response (201):**

```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "_id": "661f1c3d4e5f6a7b8c9d0e1f",
    "name": "MacBook Pro 16\"",
    "category": {
      "_id": "661f1b2c3d4e5f6a7b8c9d0e",
      "name": "Electronics"
    },
    "price": 2499.99,
    "stockQuantity": 45,
    "minThreshold": 10,
    "description": "Apple MacBook Pro with M3 chip",
    "status": "Active",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:00:00.000Z"
  }
}
```

---

#### PATCH `/products/:id`

Update a product. Status auto-toggles between `Active` ↔ `OutOfStock` based on `stockQuantity`.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/products/661f1c3d4e5f6a7b8c9d0e1f", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    price: 2299.99,
    stockQuantity: 60
  })
});
```

**Request Body:** Same fields as POST (all optional).

**Response (200):**

```json
{
  "success": true,
  "message": "Product updated",
  "data": {
    "_id": "661f1c3d4e5f6a7b8c9d0e1f",
    "name": "MacBook Pro 16\"",
    "category": {
      "_id": "661f1b2c3d4e5f6a7b8c9d0e",
      "name": "Electronics"
    },
    "price": 2299.99,
    "stockQuantity": 60,
    "minThreshold": 10,
    "description": "Apple MacBook Pro with M3 chip",
    "status": "Active",
    "createdAt": "2026-03-31T16:00:00.000Z",
    "updatedAt": "2026-03-31T16:15:00.000Z"
  }
}
```

---

#### DELETE `/products/:id`

Delete a product.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/products/661f1c3d4e5f6a7b8c9d0e1f", {
  method: "DELETE",
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted"
}
```

---

#### GET `/products/low-stock`

Get all products where `stockQuantity < minThreshold`, sorted by lowest stock first.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/products/low-stock", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "661f1c3d4e5f6a7b8c9d0e20",
      "name": "Wireless Mouse",
      "category": {
        "_id": "661f1b2c3d4e5f6a7b8c9d0e",
        "name": "Electronics"
      },
      "price": 29.99,
      "stockQuantity": 3,
      "minThreshold": 15,
      "description": "",
      "status": "Active",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    }
  ]
}
```

---

### 5. Orders

> 🔒 All Order endpoints require authentication.

---

#### GET `/orders`

List all orders (populated with product details).

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/orders", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "661f1d4e5f6a7b8c9d0e1f2a",
      "customerName": "John Doe",
      "products": [
        {
          "product": {
            "_id": "661f1c3d4e5f6a7b8c9d0e1f",
            "name": "MacBook Pro 16\"",
            "price": 2499.99,
            "status": "Active"
          },
          "quantity": 2
        }
      ],
      "totalPrice": 4999.98,
      "status": "Pending",
      "createdAt": "2026-03-31T16:30:00.000Z",
      "updatedAt": "2026-03-31T16:30:00.000Z"
    }
  ]
}
```

---

#### GET `/orders/:id`

Get a single order by ID.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/orders/661f1d4e5f6a7b8c9d0e1f2a", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):** Same structure as the array item above.

---

#### POST `/orders`

Place a new order. **Automatically deducts stock** from each product.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    customerName: "John Doe",
    products: [
      { product: "661f1c3d4e5f6a7b8c9d0e1f", quantity: 2 },
      { product: "661f1c3d4e5f6a7b8c9d0e20", quantity: 1 }
    ]
  })
});
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerName` | string | ✅ | Customer's full name |
| `products` | array | ✅ | At least 1 item |
| `products[].product` | string | ✅ | Product ObjectId |
| `products[].quantity` | number | ✅ | Quantity (≥ 1, integer) |

**Response (201):**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "661f1d4e5f6a7b8c9d0e1f2a",
    "customerName": "John Doe",
    "products": [
      {
        "product": {
          "_id": "661f1c3d4e5f6a7b8c9d0e1f",
          "name": "MacBook Pro 16\"",
          "price": 2499.99,
          "status": "Active"
        },
        "quantity": 2
      },
      {
        "product": {
          "_id": "661f1c3d4e5f6a7b8c9d0e20",
          "name": "Wireless Mouse",
          "price": 29.99,
          "status": "Active"
        },
        "quantity": 1
      }
    ],
    "totalPrice": 5029.97,
    "status": "Pending",
    "createdAt": "2026-03-31T16:30:00.000Z",
    "updatedAt": "2026-03-31T16:30:00.000Z"
  }
}
```

**Error — Insufficient Stock (400):**

```json
{
  "success": false,
  "message": "Only 3 items available in stock for \"Wireless Mouse\""
}
```

**Error — Duplicate Product (400):**

```json
{
  "success": false,
  "message": "Duplicate products in the order are not allowed"
}
```

**Error — Inactive Product (400):**

```json
{
  "success": false,
  "message": "Product \"Discontinued Item\" is inactive and cannot be ordered"
}
```

---

#### PATCH `/orders/:id/status`

Update an order's status.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/orders/661f1d4e5f6a7b8c9d0e1f2a/status", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
  },
  body: JSON.stringify({
    status: "Confirmed"
  })
});
```

**Request Body:**

| Field | Type | Required | Values |
|---|---|---|---|
| `status` | string | ✅ | `"Pending"`, `"Confirmed"`, `"Shipped"`, `"Delivered"`, `"Cancelled"` |

**Response (200):**

```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "_id": "661f1d4e5f6a7b8c9d0e1f2a",
    "customerName": "John Doe",
    "products": [ ... ],
    "totalPrice": 5029.97,
    "status": "Confirmed",
    "createdAt": "2026-03-31T16:30:00.000Z",
    "updatedAt": "2026-03-31T16:35:00.000Z"
  }
}
```

---

#### DELETE `/orders/:id`

Delete an order. **Restores stock** if the order was `Pending` or `Confirmed`.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/orders/661f1d4e5f6a7b8c9d0e1f2a", {
  method: "DELETE",
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "message": "Order deleted"
}
```

---

### 6. Restock Queue

> 🔒 Requires authentication.

---

#### GET `/restock/queue`

Get all products below their `minThreshold`, sorted by lowest stock first, with computed priority.

**Priority Calculation:**
- `gap = minThreshold - stockQuantity`
- `gapPercentage = (gap / minThreshold) × 100`
- **High** — `gapPercentage ≥ 75%`
- **Medium** — `gapPercentage ≥ 40%`
- **Low** — `gapPercentage < 40%`

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/restock/queue", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "product": {
        "_id": "661f1c3d4e5f6a7b8c9d0e20",
        "name": "Wireless Mouse",
        "category": {
          "_id": "661f1b2c3d4e5f6a7b8c9d0e",
          "name": "Electronics"
        },
        "price": 29.99,
        "stockQuantity": 2,
        "minThreshold": 15,
        "description": "",
        "status": "Active"
      },
      "gap": 13,
      "priority": "High"
    },
    {
      "product": {
        "_id": "661f1c3d4e5f6a7b8c9d0e21",
        "name": "USB-C Cable",
        "category": {
          "_id": "661f1b2c3d4e5f6a7b8c9d0e",
          "name": "Electronics"
        },
        "price": 12.99,
        "stockQuantity": 8,
        "minThreshold": 10,
        "description": "",
        "status": "Active"
      },
      "gap": 2,
      "priority": "Low"
    }
  ]
}
```

---

### 7. Dashboard

> 🔒 Requires authentication.

---

#### GET `/dashboard/summary`

Aggregated statistics for today's operations.

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/dashboard/summary", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalOrdersToday": 12,
    "revenueToday": 15499.88,
    "lowStockCount": 4,
    "productSummaries": [
      {
        "category": "Electronics",
        "totalProducts": 25,
        "averagePrice": 349.99,
        "totalStock": 580
      },
      {
        "category": "Furniture",
        "totalProducts": 10,
        "averagePrice": 899.50,
        "totalStock": 120
      }
    ]
  }
}
```

| Field | Description |
|---|---|
| `totalOrdersToday` | Count of orders created today |
| `revenueToday` | Sum of `totalPrice` for today's orders |
| `lowStockCount` | Products where `stockQuantity < minThreshold` |
| `productSummaries` | Per-category breakdown: count, avg price, total stock |

---

### 8. Activity Logs

> 🔒 Requires authentication.

---

#### GET `/activity-logs`

Get the latest 10 system actions (auto-pruned, newest first).

**Request:**

```javascript
fetch("http://localhost:5000/api/v1/activity-logs", {
  headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
});
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "661f1e5f6a7b8c9d0e1f2a3b",
      "action": "Order created for John Doe",
      "createdAt": "2026-03-31T16:30:00.000Z",
      "updatedAt": "2026-03-31T16:30:00.000Z"
    },
    {
      "_id": "661f1e5f6a7b8c9d0e1f2a3c",
      "action": "Product updated: MacBook Pro 16\"",
      "createdAt": "2026-03-31T16:15:00.000Z",
      "updatedAt": "2026-03-31T16:15:00.000Z"
    },
    {
      "_id": "661f1e5f6a7b8c9d0e1f2a3d",
      "action": "Category created: Electronics",
      "createdAt": "2026-03-31T16:00:00.000Z",
      "updatedAt": "2026-03-31T16:00:00.000Z"
    }
  ]
}
```

---

## Business Rules

### Stock Deduction
- Stock is **atomically deducted** when an order is placed using `findOneAndUpdate` with a `$gte` guard.
- If requested quantity exceeds available stock → `"Only X items available in stock for \"Product Name\""`.
- If stock reaches **0** → product status auto-changes to `"OutOfStock"`.
- Deleting a `Pending` or `Confirmed` order **restores stock** and re-activates the product if needed.

### Conflict Handling
- **Duplicate products** in a single order → rejected.
- **Inactive/OutOfStock products** → cannot be ordered.

### Restock Queue
- Computed on-the-fly (no separate DB table).
- Products where `stockQuantity < minThreshold` are sorted by lowest stock.
- Priority assigned based on gap percentage: **High** (≥75%), **Medium** (≥40%), **Low** (<40%).

### Activity Log
- Automatically tracks actions: user registration, category/product CRUD, order placement/status changes.
- Capped at **10 entries** — oldest records are pruned when new ones are added.

### Auto Status Toggle
- Products auto-toggle to `"OutOfStock"` when `stockQuantity` drops to 0.
- Products auto-toggle back to `"Active"` when `stockQuantity` is restored above 0.

---

## Testing

Tests use **mongodb-memory-server** — no external MongoDB needed.

```bash
npm test
```

### Test Suites

| Suite | Tests | Description |
|---|---|---|
| `auth.test.ts` | 6 | Signup, duplicate rejection, invalid email, login, wrong password, demo login |
| `product.test.ts` | 4 | Create, low-stock detection, auto OutOfStock, re-activate on restock |
| `order.test.ts` | 5 | Stock deduction, insufficient stock error, duplicate rejection, inactive blocking, status update |

**Results: 3 suites, 15 tests — all passing ✅**

---

## Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

| Status | When |
|---|---|
| `400` | Validation error, bad request, business rule violation |
| `401` | Missing/invalid JWT token |
| `404` | Resource not found |
| `409` | Duplicate resource (e.g., email already registered) |
| `500` | Internal server error |

The `errors` array is only present for Zod/Mongoose validation failures. For business logic errors, only `message` is provided.
