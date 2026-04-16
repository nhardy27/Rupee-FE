// Application routing configuration
import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/admin/profile";
import { Users } from "./pages/admin/users";
import { Transactions } from "./pages/admin/transactions";
import { Categories } from "./pages/admin/categories";
import { Types } from "./pages/admin/types";
import { PaymentMethods } from "./pages/admin/paymentMethods";
import { Roles } from "./pages/admin/roles";
import { Reports } from "./pages/admin/reports";
import { Settings } from "./pages/admin/settings";
import { AuditLogs } from "./pages/admin/auditLogs";
import { AIQuestions } from "./pages/admin/aiQuestions";

// Define all application routes with their corresponding components
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login, // Login page as the default route
  },
  {
    path: "/dashboard",
    Component: Dashboard, // Main dashboard with statistics
  },
  {
    path: "/profile",
    Component: Profile, // Admin profile management page
  },
  {
    path: "/users",
    Component: Users, // User management page
  },
  {
    path: "/transactions",
    Component: Transactions, // Transaction management page
  },
  {
    path: "/categories",
    Component: Categories, // Category management page
  },
  {
    path: "/types",
    Component: Types, // Type management page
  },
  {
    path: "/payment-methods",
    Component: PaymentMethods, // Payment method management page
  },
  {
    path: "/roles",
    Component: Roles, // Role and permissions management page
  },
  {
    path: "/reports",
    Component: Reports, // Reports page
  },
  {
    path: "/settings",
    Component: Settings, // Settings page
  },
  {
    path: "/audit-logs",
    Component: AuditLogs, // Audit logs page
  },
  {
    path: "/ai-questions",
    Component: AIQuestions, // AI Questions management page
  },
]);
