# DentalFlow

A minimalist, high-usability web application for dental clinics to manage patients, appointments, and billing.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/syedwasiqbukhari-123/fdc-os-test-app-20251025-091828)

## About The Project

DentalFlow is a minimalist, high-usability web application designed for small-to-medium dental clinics. It aims to replace paper registers by providing a clean, intuitive digital solution for managing clinic operations. The application features role-based access control for Admins, Managers, Doctors, Accountants, Inventory Keepers, and Patients. Core modules include a dynamic appointments calendar, comprehensive patient records, staff management, service cataloging, inventory tracking, and streamlined invoicing. The user interface is built on principles of minimalism and clarity, ensuring a low cognitive load and fast workflows for common tasks. All financial transactions and displays default to PKR (Pakistani Rupee). The system is built on a modern, serverless stack using Cloudflare Workers for performance and scalability.

## Key Features

-   **Role-Based Access Control:** Pre-defined roles (Admin, Manager, Doctor, etc.) with configurable permissions.
-   **Appointment Management:** An interactive calendar for scheduling, viewing, and managing patient appointments.
-   **Patient Records:** A comprehensive system for managing patient information, visit history, and treatment plans.
-   **Staff Management:** Admin-only module to manage staff accounts and roles.
-   **Services Catalog:** Define and manage all dental services offered, including pricing and duration.
-   **Invoicing & Payments:** Streamlined invoice creation and payment tracking.
-   **Inventory Tracking:** Manage dental supplies, track stock levels, and receive low-stock alerts.
-   **Dashboard & Reports:** At-a-glance view of key clinic metrics and generation of financial reports.
-   **Patient Portal:** A secure, view-only portal for patients to access their appointment and invoice history.

## Technology Stack

-   **Frontend:**
    -   React & Vite
    -   React Router for navigation
    -   Tailwind CSS for styling
    -   shadcn/ui for the component library
    -   Zustand for state management
    -   React Hook Form & Zod for forms and validation
    -   Lucide React for icons
    -   Recharts for data visualization
-   **Backend:**
    -   Hono running on Cloudflare Workers
-   **Database:**
    -   Cloudflare Durable Objects for state persistence
-   **Language:**
    -   TypeScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later)
-   Bun
-   Wrangler CLI - `bun install -g wrangler`

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/dentalflow_clinic_management.git
    cd dentalflow_clinic_management
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

## Running the Development Server

To run the application in development mode, which includes hot-reloading for the frontend and backend:

```sh
bun run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

This project is designed for deployment on the Cloudflare network.

1.  **Login to Cloudflare:**
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    ```sh
    bun run deploy
    ```

This command will build the application and deploy it to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/syedwasiqbukhari-123/fdc-os-test-app-20251025-091828)

## Project Structure

-   `shared/`: Contains TypeScript types and shared data structures used by both the frontend and the backend worker.
-   `src/`: The frontend React application source code.
    -   `components/`: Reusable UI components, including the shadcn/ui library.
    -   `pages/`: Top-level page components for each route.
    -   `lib/`: Utility functions, API client, and other core logic.
    -   `hooks/`: Custom React hooks.
-   `worker/`: The backend Hono application source code that runs on Cloudflare Workers.
    -   `index.ts`: The entry point for the worker.
    -   `user-routes.ts`: API route definitions.
    -   `entities.ts`: Data models and logic for interacting with Durable Objects.
    -   `core-utils.ts`: Core utilities for the Durable Object framework.

## License

Distributed under the MIT License. See `LICENSE` for more information.