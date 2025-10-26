import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
// Layouts and Pages
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { PatientsPage } from '@/pages/PatientsPage';
import { PatientDetailPage } from '@/pages/PatientDetailPage';
import { StaffPage } from '@/pages/StaffPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PatientPortalPage } from '@/pages/PatientPortalPage';
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "appointments",
            element: <AppointmentsPage />,
          },
          {
            path: "patients",
            element: <PatientsPage />,
          },
          {
            path: "patients/:id",
            element: <PatientDetailPage />,
          },
          {
            path: "staff",
            element: <StaffPage />,
          },
          {
            path: "services",
            element: <ServicesPage />,
          },
          {
            path: "invoices",
            element: <InvoicesPage />,
          },
          {
            path: "inventory",
            element: <InventoryPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "portal",
            element: <PatientPortalPage />,
          }
        ],
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);