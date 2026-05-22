# Thuruvan Client Dashboard Architecture

A highly scalable, modern, and modular folder structure following **Clean Architecture** patterns for the E-Seva payment and operations dashboard.

---

## 📂 ASCII Directory Structure Tree

```text
src/
├── assets/                  # Static assets (images, icons, vectors, logos, fonts)
├── components/              # Global reusable UI components
│   ├── charts/              # Global charting visual components
│   │   └── ActivityChart.tsx
│   └── CommandBar.tsx       # Reusable command & action bars
├── config/                  # App configurations, constants, mockup data schemas
│   └── data.ts              # Core navigation, statistics, status mockup configurations
├── hooks/                   # Globally available custom React hooks
│   └── useLocalStorage.ts  # SSR-safe local storage state syncer
├── layouts/                 # Core application shells, navbars, sidebars, structures
│   ├── AppShell.tsx         # Responsive application frame
│   ├── Sidebar.tsx          # Collapsible navigation drawer
│   └── TopBar.tsx           # Global utility navbar with theme toggling
├── pages/                   # Application page containers
│   ├── ActivationPage.tsx   # Activation workflows
│   ├── PaymentsPage.tsx     # Payment management page
│   ├── PermissionPage.tsx   # User roles and ACL controls
│   ├── PlaceholderPage.tsx  # Generic module wrapper
│   ├── UsersPage.tsx        # Customer and retailer tables
│   ├── WalletPage.tsx       # Detailed financial analytics
│   ├── dashboard/           # Feature-based modular dashboard components
│   │   ├── DashboardPage.tsx# Primary operations page
│   │   ├── DashboardOverview.tsx
│   │   ├── ServiceQueue.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── WalletHealth.tsx
│   │   └── WalletSummary.tsx
│   └── retailers/           # Modular retailer directory
│       ├── RetailersPage.tsx# Retailers list and administration
│       ├── RetailerForm.tsx # Registration and editing form
│       ├── RetailerTable.tsx# Interactive tables and filters
│       ├── RetailerStats.tsx# Operational summary insights
│       └── types.ts         # Strictly-typed interfaces


├── pdf/                     # PDF templates, download engines, generators
│   └── PdfPage.tsx          # PDF document generation page
├── routes/                  # Centralized router paths & route authentication guards
│   ├── paths.ts             # Direct route constants matching Next.js/React structure
│   └── ProtectedRoute.tsx   # Role-based JWT/Session protection wrapper
├── services/                # API service handlers (Axios clients, endpoints, requests)
├── status/                  # Status tracking and workflow modules
│   ├── StatusPage.tsx       # Service tickets and live queue statuses
│   ├── StatusStats.tsx      # Operational metric filters
│   ├── StatusTable.tsx      # Dynamic search-driven listings
│   ├── StatusDetailModal.tsx# Administrative workflow updates
│   └── types.ts             # Strictly-typed interfaces

├── store/                   # Global state providers and contexts
│   └── context/
│       ├── AuthContext.tsx  # State manager for authentication & authorization
│       └── ThemeProvider.tsx# HSL-tailored visual system context
├── styles/                  # Tailwind custom configurations, styles, animations
└── utils/                   # Shared pure utility helper functions
    └── formatters.ts        # Pure formatters for INR, Dates, Files, Phone Numbers
```

---

## 🏛️ Clean Architecture Core Principles

1. **Separation of Concerns (SoC)**: Reusable visual building blocks (components/layouts) are isolated from domain logic (pages/store).
2. **Centralized Configurations**: Core application constants (routes/mockup data/configs) are kept outside components for seamless maintenance.
3. **Pure Utilities & SSR-Safe Custom Hooks**: Hook layers automatically adapt to Next.js / server-side compilation, ensuring high performance.
4. **Role-Based Guards**: Protected routes dynamically inspect authenticated JWT claims/roles to secure workflows.
5. **Theme Harmonization**: Providers default to custom tailored light/dark modes using system storage memory.
