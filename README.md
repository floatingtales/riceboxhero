# Ricebox Hero 🍚🥡

Ricebox Hero is a modern, lightweight Point of Sale (POS) and business management dashboard built for a specialized food service operation. It provides a seamless interface for handling orders, managing menus and customers, and gaining valuable insights into daily, weekly, and monthly business performance.

I built this to practice a little bit of small full-stack application. I've gotten my hands full with a lot of enterprise-level projects that I can't really share to the public. I also wanted to make a simple, yet modern and user-friendly interface for my friend's business.

I'm not a designer, but I tried my best to make it look good, thanks to [magicpatterns](https://magicpatterns.co/).

## ✨ Features

### 📊 Comprehensive Dashboard
*   **Real-time Metrics**: Track revenue, order volume, and performance grouped by day, week, or month.
*   **Analytics & Breakdowns**: Visual insights into payment methods and menu type distributions.
*   **Leaderboards**: Track top-selling items and best customers to reward loyalty and optimize inventory.

### 🛒 Order Management
*   **Effortless Ordering**: Create, process, and track orders from pending to completion.
*   **Status Tracking**: Manage order lifecycle with clear statuses (`Pending`, `Paid`, `Completed`, `Voided`).
*   **Order History**: Review historical orders and quickly search past transactions.
*   **Receipts**: Built-in receipt generation and viewing capabilities.

### 👥 Customer & Menu Control
*   **Menu Management**: Organize and update menu offerings.
*   **Customer Database**: Track customer profiles, activity statuses, and order history.

### 🔒 Security & Performance
*   **Custom Authentication**: Secure, session-based login system.
*   **Rate Limiting**: API protection powered by Upstash Redis to prevent abuse.
*   **Optimized Performance**: Lightning-fast data fetching with tRPC and React Query.

## 🛠️ Tech Stack

This project is bootstrapped with `create-t3-app` and heavily customized with modern robust tooling:

*   **Framework**: [Next.js 15](https://nextjs.org) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **UI Components & Styling**: [Mantine UI v8](https://mantine.dev/) & [Tabler Icons](https://tabler-icons.io/)
*   **Data Fetching**: [tRPC](https://trpc.io) & [TanStack React Query](https://tanstack.com/query/latest)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team)
*   **Caching / Rate Limiting**: [Upstash Redis](https://upstash.com/)
*   **Code Quality**: [Biome](https://biomejs.dev/) for blazing-fast linting and formatting

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and `pnpm` installed. You will also need a PostgreSQL database and an Upstash Redis instance (or local Redis).

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Environment Variables:**
   Copy the example environment file and fill in your database and Redis credentials:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Run the Drizzle migrations to set up your PostgreSQL schema:
   ```bash
   pnpm db:migrate
   ```

4. **Run the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts Overview

*   `pnpm dev`: Starts the Next.js development server.
*   `pnpm build`: Runs database migrations and builds the Next.js app for production.
*   `pnpm check`: Runs Biome to lint and format the codebase.
*   `pnpm db:studio`: Opens Drizzle Studio to view and edit database records.
*   `pnpm db:migrate`: Applies migrations to the database.
