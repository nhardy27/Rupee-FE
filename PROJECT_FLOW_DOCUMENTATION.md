# 🚀 Rupee Admin Panel - Complete Project Flow Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Application Flow](#application-flow)
5. [Module Details](#module-details)
6. [API Integration](#api-integration)
7. [Routing System](#routing-system)
8. [Component Architecture](#component-architecture)

---

## 🎯 Project Overview

**Project Name:** Rupee Admin Panel  
**Type:** Modern Admin Dashboard for Financial Management  
**Purpose:** Admin panel for managing users, transactions, categories, payment methods, roles, and reports

---

## 🛠️ Technology Stack

### Core Technologies
1. **React 18.3.1** - UI Library
2. **TypeScript** - Type Safety
3. **Vite 6.3.5** - Build Tool & Dev Server
4. **React Router 7.13.0** - Routing

### UI Libraries
1. **Tailwind CSS 4.1.12** - Styling Framework
2. **Material-UI (MUI) 7.3.5** - Component Library
3. **Radix UI** - Headless UI Components (30+ packages)
4. **Lucide React** - Icons
5. **Emotion** - CSS-in-JS

### Additional Libraries
1. **React Hook Form** - Form Management
2. **Recharts** - Data Visualization
3. **Date-fns** - Date Utilities
4. **Framer Motion** - Animations
5. **React DnD** - Drag & Drop
6. **Sonner** - Toast Notifications

---

## 📁 Project Structure

```
RUpee FE/
│
├── index.html                    # Entry HTML file
├── package.json                  # Dependencies & Scripts
├── vite.config.ts               # Vite Configuration
├── postcss.config.mjs           # PostCSS Config
├── README.md                    # Project README
│
├── src/
│   ├── main.tsx                 # Application Entry Point ⭐ START
│   │
│   ├── app/
│   │   ├── App.tsx              # Root Component
│   │   ├── routes.tsx           # Route Configuration
│   │   │
│   │   ├── components/          # Reusable Components
│   │   │   ├── Layout.tsx       # Main Layout Wrapper
│   │   │   ├── Sidebar.tsx      # Navigation Sidebar
│   │   │   ├── Header.tsx       # Top Header Bar
│   │   │   ├── StatCard.tsx     # Dashboard Stat Cards
│   │   │   ├── ui/              # UI Components (Radix)
│   │   │   └── figma/           # Figma Components
│   │   │
│   │   └── pages/               # Page Components
│   │       ├── Login.tsx        # Login Page
│   │       ├── Dashboard.tsx    # Dashboard Page
│   │       └── admin/           # Admin Pages
│   │           ├── users.tsx
│   │           ├── transactions.tsx
│   │           ├── categories.tsx
│   │           ├── types.tsx
│   │           ├── paymentMethods.tsx
│   │           ├── roles.tsx
│   │           ├── reports.tsx
│   │           └── settings.tsx
│   │
│   ├── config/
│   │   └── global.json          # API Configuration
│   │
│   ├── utils/
│   │   └── api.ts               # API Helper Functions
│   │
│   └── styles/
│       ├── index.css            # Main Styles
│       ├── tailwind.css         # Tailwind Imports
│       ├── fonts.css            # Font Definitions
│       └── theme.css            # Theme Variables
│
└── guidelines/
    └── Guidelines.md            # Development Guidelines
```

---

## 🔄 Application Flow (Step by Step)

### 1️⃣ **Application Initialization** (index.html → main.tsx)

**File: `index.html`**
```
Browser loads index.html
↓
Loads <div id="root"></div>
↓
Executes <script src="/src/main.tsx">
```

**File: `src/main.tsx`** ⭐ **START POINT**
```typescript
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

**Kya hota hai:**
- React DOM root create hota hai
- App component render hota hai
- Global styles load hote hain

---

### 2️⃣ **Root Component Setup** (App.tsx)

**File: `src/app/App.tsx`**
```typescript
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
```

**Kya hota hai:**
- React Router setup hota hai
- Routes configuration load hota hai
- URL ke basis pe pages render hote hain

---

### 3️⃣ **Routing Configuration** (routes.tsx)

**File: `src/app/routes.tsx`**

**10 Routes Define Hain:**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Login | Login Page (Entry Point) |
| `/dashboard` | Dashboard | Main Dashboard |
| `/users` | Users | User Management |
| `/transactions` | Transactions | Transaction Management |
| `/categories` | Categories | Category Management |
| `/types` | Types | Type Management |
| `/payment-methods` | PaymentMethods | Payment Method Management |
| `/roles` | Roles | Role & Permission Management |
| `/reports` | Reports | Reports & Analytics |
| `/settings` | Settings | Application Settings |

**Flow:**
```
User visits URL
↓
Router matches path
↓
Loads corresponding component
↓
Component renders with Layout
```

---

### 4️⃣ **Authentication Flow** (Login.tsx)

**File: `src/app/pages/Login.tsx`**

**Login Process:**

```
User enters credentials (username, password)
↓
Form submits to API: POST /auth/token/
↓
API returns: { access: "token", refresh: "refresh_token" }
↓
Tokens saved in localStorage
↓
Verify superuser: GET /api/v1/isSuperUser/
↓
If superuser → Navigate to /dashboard
↓
If not → Show error
```

**Key Features:**
- JWT Token Authentication
- Remember Me functionality
- Token refresh mechanism
- Superuser verification

**LocalStorage Data:**
```javascript
localStorage.setItem('token', data.access);      // Access Token
localStorage.setItem('refresh', data.refresh);   // Refresh Token
```

---

### 5️⃣ **Dashboard Flow** (Dashboard.tsx)

**File: `src/app/pages/Dashboard.tsx`**

**Dashboard Load Process:**

```
Component mounts
↓
useEffect triggers
↓
Fetch data from 2 APIs in parallel:
  1. GET /api/v1/user/ (Total Users)
  2. GET /api/v1/transaction/ (Transactions)
↓
Calculate statistics:
  - Total Users
  - Total Transactions
  - Total Income (filter by type = "Income")
  - Total Expense (filter by type = "Expense")
↓
Update state with stats
↓
Render 4 StatCards with data
```

**Components Used:**
- Layout (wrapper)
- StatCard (4 cards for stats)
- Icons: Users, ArrowLeftRight, TrendingUp, TrendingDown

---

### 6️⃣ **Layout System** (Layout.tsx)

**File: `src/app/components/Layout.tsx`**

**Layout Structure:**
```
┌─────────────────────────────────────┐
│         Sidebar (Left)              │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │      Header (Top)            │   │
│  │                              │   │
│  ├──────────────────────────────┤   │
│  │                              │   │
│  │      Main Content            │   │
│  │      (children)              │   │
│  │                              │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Features:**
- Collapsible Sidebar (Desktop)
- Mobile Menu (Hamburger)
- Breadcrumb Navigation
- Search Functionality
- Responsive Design

**State Management:**
```typescript
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
```

---

### 7️⃣ **Sidebar Navigation** (Sidebar.tsx)

**File: `src/app/components/Sidebar.tsx`**

**9 Menu Items:**

1. 📊 Dashboard
2. 👥 Users
3. 📝 Types
4. 📁 Categories
5. 💳 Payment Methods
6. 🛡️ Roles & Permissions
7. 📄 Reports
8. 🔄 Transactions
9. ⚙️ Settings

**Navigation Flow:**
```
User clicks menu item
↓
handleNavigation(itemId) called
↓
onNavigate(itemId) updates active state
↓
navigate(`/${itemId}`) changes route
↓
Router loads new component
```

**Logout Flow:**
```
User clicks Logout
↓
localStorage.removeItem('token')
localStorage.removeItem('refresh')
↓
navigate('/') → Back to Login
```

---

### 8️⃣ **Header Component** (Header.tsx)

**File: `src/app/components/Header.tsx`**

**Features:**
- Page Title Display
- Breadcrumb Navigation
- Search Bar (Desktop)
- Notification Bell (with red dot indicator)
- Admin Profile Dropdown
  - Profile
  - Account Settings
  - Logout

**Mobile Features:**
- Hamburger Menu Button
- Responsive Search (hidden on mobile)

---

### 9️⃣ **User Management Flow** (users.tsx)

**File: `src/app/pages/admin/users.tsx`**

**Complete CRUD Operations:**

#### **READ (Fetch Users)**
```
Component mounts
↓
checkAuth() verifies token
↓
GET /api/v1/user/
↓
Filter out superusers
↓
Display in table
```

#### **CREATE (Add User)**
```
Click "Add User" button
↓
Modal opens with form
↓
Fill form (email, password, name, contact, DOB)
↓
Submit → POST /api/v1/createUser/
↓
Success → Close modal, refresh list
```

#### **UPDATE (Edit User)**
```
Click Edit icon
↓
Load user data in form
↓
Modify fields
↓
Submit → PUT /api/v1/user/{id}/
↓
Success → Close modal, refresh list
```

#### **DELETE (Remove User)**
```
Click Delete icon
↓
Confirm dialog
↓
DELETE /api/v1/deleteUser/
↓
Success → Refresh list
```

#### **SEARCH (Filter Users)**
```
Type in search box
↓
Debounce 300ms
↓
GET /api/v1/user/?search={query}
↓
Update table with filtered results
```

**Form Fields:**
- Email (required)
- Password (required for new user)
- First Name (required)
- Last Name (required)
- Contact Number (required)
- Date of Birth (DD/MM/YYYY format)
- Groups (default: [1])

---

### 🔟 **API Integration** (api.ts)

**File: `src/utils/api.ts`**

**API Helper Function:**

```typescript
apiRequest(url, options)
```

**Features:**

1. **Auto Token Injection**
```javascript
Authorization: Bearer {token}
```

2. **Auto Token Refresh**
```
Request fails with 401
↓
Get refresh token from localStorage
↓
POST /auth/token/refresh/
↓
Get new access token
↓
Retry original request
↓
If refresh fails → Logout user
```

3. **Auto Logout on Auth Failure**
```
Token refresh fails
↓
localStorage.clear()
↓
window.location.href = '/'
```

---

## 🔌 API Configuration

**File: `src/config/global.json`**

**Backend API Base URL:**
```
http://192.168.1.8:8000
```

**All API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/token/` | POST | Login & Get Tokens |
| `/auth/token/refresh/` | POST | Refresh Access Token |
| `/api/v1/user/` | GET | Fetch Users |
| `/api/v1/createUser/` | POST | Create User |
| `/api/v1/deleteUser/` | DELETE | Delete User |
| `/api/v1/user/{id}/` | PUT | Update User |
| `/api/v1/isSuperUser/` | GET | Check Superuser |
| `/api/v1/transaction/` | GET | Fetch Transactions |
| `/api/v1/category/` | GET | Fetch Categories |
| `/api/v1/type/` | GET | Fetch Types |
| `/api/v1/paymentMethod/` | GET | Fetch Payment Methods |
| `/api/v1/role/` | GET | Fetch Roles |
| `/api/v1/permission/` | GET | Fetch Permissions |
| `/api/v1/changeMyPassword/` | POST | Change Password |
| `/api/v1/passwordReset/` | POST | Reset Password |

---

## 🎨 Styling System

### Tailwind CSS Configuration
- Custom colors: Gray scale (#F9FAFB, #E5E7EB, #6B7280, etc.)
- Responsive breakpoints: sm, md, lg
- Custom animations via tw-animate-css

### Color Palette
```css
Background: #F9FAFB
Border: #E5E7EB
Text Primary: #111827
Text Secondary: #6B7280
Accent: #374151
Success: #22C55E
Error: #EF4444
```

---

## 🔐 Security Features

1. **JWT Authentication**
   - Access Token (short-lived)
   - Refresh Token (long-lived)

2. **Protected Routes**
   - Auth check before API calls
   - Auto redirect to login if unauthorized

3. **Token Management**
   - Auto refresh on expiry
   - Secure storage in localStorage

4. **Superuser Verification**
   - Only superusers can access admin panel

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Mobile Features
- Hamburger menu
- Collapsible sidebar
- Hidden search bar
- Touch-friendly buttons

---

## 🚀 Development Commands

```bash
# Install dependencies
npm i

# Start development server
npm run dev

# Build for production
npm run build
```

**Dev Server:** http://localhost:5173 (default Vite port)

---

## 📊 Data Flow Summary

```
User Action
    ↓
Component Event Handler
    ↓
API Request (with token)
    ↓
Backend API
    ↓
Response Data
    ↓
State Update (useState)
    ↓
UI Re-render
    ↓
User sees updated data
```

---

## 🔄 Complete User Journey

### First Time User
```
1. Open app → Redirected to /
2. See Login page
3. Enter credentials
4. Submit form
5. API validates
6. Tokens saved
7. Redirected to /dashboard
8. See dashboard with stats
9. Click sidebar menu
10. Navigate to different pages
11. Perform CRUD operations
12. Logout → Back to login
```

### Returning User (with valid token)
```
1. Open app
2. Token exists in localStorage
3. Auto authenticated
4. Direct access to pages
5. Token auto-refreshes if expired
```

---

## 🎯 Key Features Summary

✅ JWT Authentication  
✅ Auto Token Refresh  
✅ Protected Routes  
✅ Responsive Design  
✅ CRUD Operations  
✅ Search & Filter  
✅ Real-time Stats  
✅ Modal Forms  
✅ Toast Notifications  
✅ Error Handling  
✅ Loading States  
✅ Mobile Menu  
✅ Collapsible Sidebar  
✅ Breadcrumb Navigation  

---

## 🏗️ Component Hierarchy

```
App
└── RouterProvider
    └── Routes
        ├── Login (/)
        └── Dashboard (/dashboard)
            └── Layout
                ├── Sidebar
                │   └── Menu Items (9)
                ├── Header
                │   ├── Search
                │   ├── Notifications
                │   └── Profile Dropdown
                └── Main Content
                    └── StatCards (4)
```

---

## 📝 State Management

**No Redux/Context API used**  
**Uses React's built-in hooks:**

- `useState` - Local component state
- `useEffect` - Side effects & API calls
- `useNavigate` - Programmatic navigation
- `useLocation` - Current route info
- `useCallback` - Memoized callbacks

---

## 🎓 Learning Points

1. **Vite** - Fast build tool
2. **React Router v7** - Latest routing
3. **TypeScript** - Type safety
4. **Tailwind CSS** - Utility-first CSS
5. **JWT Auth** - Token-based authentication
6. **API Integration** - RESTful APIs
7. **CRUD Operations** - Complete data management
8. **Responsive Design** - Mobile-first approach
9. **Component Architecture** - Reusable components
10. **Modern React** - Hooks & functional components

---

## 🐛 Error Handling

1. **API Errors** - Try-catch blocks
2. **Auth Errors** - Auto logout & redirect
3. **Form Validation** - Required fields
4. **Network Errors** - Error messages
5. **Loading States** - Loading indicators

---

## 🎉 Conclusion

**Project Flow Summary:**

```
index.html 
  → main.tsx (Entry)
    → App.tsx (Router Setup)
      → routes.tsx (Route Config)
        → Login.tsx (Auth)
          → Dashboard.tsx (Main)
            → Layout.tsx (Structure)
              → Sidebar.tsx (Navigation)
              → Header.tsx (Top Bar)
              → Admin Pages (CRUD)
```

**Total Files:** ~50+  
**Total Components:** 20+  
**Total Routes:** 10  
**Total API Endpoints:** 15+  
**Total Dependencies:** 50+

---

**Created by:** Amazon Q  
**Date:** 2024  
**Version:** 1.0  

---

## 📞 Support

For any queries, refer to:
- README.md
- Guidelines.md
- Code comments

**Happy Coding! 🚀**
