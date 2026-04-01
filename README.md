# Smart Inventory & Order Management System

A production-ready, full-stack application built for efficient inventory tracking, order fulfillment, and real-time business analytics. This project follows a modular architecture with a dedicated **Next.js 16** frontend and a **TypeScript/Express** REST API.

---

## 🏗 Project Architecture

The codebase is organized into two main components:

- **[Client](./Client)**: A modern React-based frontend using the Next.js App Router, Redux Toolkit for state management, and Ant Design for a premium UI/UX.
- **[Server](./Server)**: A robust Node.js REST API built with Express, MongoDB (Mongoose), and Zod for strict request validation and type safety.

---

## 🛠 Unified Tech Stack

### Frontend (Client)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + RTK Query (including persistence)
- **UI Components**: Ant Design (AntD)
- **Styling**: Tailwind CSS + next-themes (Dark/Light mode)
- **Icons**: Lucide React + Ant Design Icons

### Backend (Server)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Validation**: Zod (Schema-based validation)
- **Security**: JWT (jsonwebtoken), bcrypt (hashing), CORS, Helmet
- **Logging**: Morgan (HTTP) + Custom Activity Logger (capped at 10 latest events)
- **Testing**: Jest + Supertest

---

## 🚀 Key Features

- **Inventory Control**: Full CRUD operations for products and categories with automatic low-stock priority queueing.
- **Order Fulfillment**: Intelligent order creation with stock conflict detection and a multi-step status workflow (Pending → Delivered).
- **Secure Authentication**: BFF (Backend for Frontend) proxy pattern utilizing HttpOnly cookies for maximum token security.
- **Real-time Dashboard**: Live summary of key metrics, revenue today, and a capped 10-event system activity log.
- **Automation**: Automatic stock deduction on orders, auto-restoration on cancellations, and "Out of Stock" status toggling.
- **Reporting**: Exportable product data (Excel/XLSX support) and detailed inventory health indicators.

---

## 📁 Root Structure

```text
smart-inventory-management/
├── Client/                 # Next.js Frontend
│   ├── src/app/            # App Router pages
│   ├── src/components/     # UI Components
│   └── src/redux/          # Global State & API Slices
├── Server/                 # Express Backend API
│   ├── src/api/v1/         # Versioned API routes
│   ├── src/middleware/     # Auth, Logging, Error handling
│   └── tests/              # Jest Automated Tests
└── README.md               # Root Project Overview
```

---

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas URI)

### 2. Backend Setup (Server)
```bash
cd Server
npm install
cp .env.example .env
# Update .env with MONGODB_URI and JWT_SECRET
npm run dev
```

### 3. Frontend Setup (Client)
```bash
cd Client
npm install
cp .env.example .env
# Ensure NEXT_PUBLIC_BASE_URL points to your Server (default: http://localhost:5000/api/v1)
npm run dev
```

---

## 🔐 Credentials for Demo

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `123456` |
| **Demo User** | `demo@inventory.com` | `Demo@1234` |

---

## 📄 Further Reading
For detailed information on specific modules, refer to:
- 📖 [**Client Documentation**](./Client/README.md)
- 📖 [**Server Documentation**](./Server/README.md)

---

## ⚖️ License
This project is for demonstration and production-readiness exploration.
