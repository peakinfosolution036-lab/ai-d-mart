# AI D Mart - Application Architecture

## 🏗️ Architecture Overview

This is a **Next.js 14** application with separate Admin and Customer portals, supporting multi-customer sessions.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Landing   │    │   Customer  │    │       Admin         │ │
│  │    Page     │    │   Portal    │    │      Portal         │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      API Routes (Next.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  /api/auth/login    - Handles Admin & Customer login     │   │
│  │  /api/auth/logout   - Clears session & cookies           │   │
│  │  /api/auth/register - New customer registration          │   │
│  │  /api/auth/me       - Session verification               │   │
│  │  /api/admin/*       - Admin-only endpoints               │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     State Management                             │
│  ┌──────────────┐    ┌───────────────┐                          │
│  │ AuthContext  │    │  DataContext  │                          │
│  │ - isLoggedIn │    │  - events     │                          │
│  │ - user       │    │  - products   │                          │
│  │ - role       │    │  - jobs       │                          │
│  │ - sessions   │    │  - offers     │                          │
│  └──────────────┘    └───────────────┘                          │
├─────────────────────────────────────────────────────────────────┤
│                      Database Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MockDatabase (In-memory) - Replace with real DB         │   │
│  │  - Admins, Customers, Sessions                           │   │
│  │  - Events, Products, Jobs, Offers, Rewards               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

### Admin Login Flow
```
1. Admin visits /login
2. Selects "Admin" role
3. Enters credentials (ID/Email + Password)
4. API validates against admin database
5. Creates session token + cookies
6. Redirects to /admin/dashboard
```

### Customer Login Flow
```
1. Customer visits /login
2. Selects "Customer" role (default)
3. Enters credentials (ID/Mobile/Email + Password)
4. API validates against customer database
5. Checks account status (Active/Pending/Suspended)
6. Creates session token + cookies
7. Redirects to /dashboard
```

### Multi-Session Support
- Each login creates a NEW session
- Multiple sessions can exist for the same user
- Session list viewable in /api/auth/me response
- Each session has its own expiration
- Logout only affects current session

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   ├── login/
│   │   └── page.tsx              # Unified login (Admin/Customer)
│   ├── register/
│   │   └── page.tsx              # Customer registration
│   ├── dashboard/
│   │   └── page.tsx              # Customer dashboard
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx          # Admin dashboard
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts    # POST - Login
│       │   ├── logout/route.ts   # POST - Logout
│       │   ├── register/route.ts # POST - Register
│       │   └── me/route.ts       # GET - Session check
│       └── admin/
│           └── customers/route.ts # GET/PATCH - Customer mgmt
│
├── components/                   # Shared components
│   ├── AppLayout.tsx             # Navigation layout
│   └── LandingPage.tsx           # Landing sections
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   └── DataContext.tsx           # Application data
│
├── lib/                          # Utility functions
│   ├── auth.ts                   # Auth helpers
│   └── db.ts                     # Mock database
│
├── types/                        # TypeScript types
│   └── index.ts
│
└── constants/                    # App constants
    └── index.ts
```

## 👤 User Types

### AdminUser
```typescript
{
  id: string;              // ADM0001
  email: string;
  mobile: string;
  name: string;
  role: 'ADMIN';
  department: string;      // Super Admin, User Management, etc.
  permissions: string[];   // MANAGE_USERS, MANAGE_PRODUCTS, etc.
  isSuperAdmin: boolean;
}
```

### CustomerUser
```typescript
{
  id: string;              // DI0023
  email: string;
  mobile: string;
  fullName: string;
  dob: string;
  role: 'CUSTOMER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  walletBalance: number;
  rewardPoints: number;
  kycVerified: boolean;
}
```

## 🔑 Admin Permissions

| Permission | Description |
|------------|-------------|
| SUPER_ADMIN | Full access to everything |
| MANAGE_USERS | View, approve, suspend customers |
| MANAGE_PRODUCTS | Create, edit, delete products |
| MANAGE_ORDERS | View)and manage orders |
| MANAGE_EVENTS | Create and manage events |
| MANAGE_JOBS | Post and manage job listings |
| MANAGE_OFFERS | Create discount offers |
| MANAGE_REWARDS | Manage reward catalog |
| VIEW_REPORTS | Access analytics and reports |
| MANAGE_SETTINGS | System configuration |

## 🍪 Session & Cookies

```
session_token: string  (httpOnly, secure, 24h expiry)
user_role: string      (accessible by JS, 24h expiry)
```

## 📡 API Endpoints

### Authentication

#### POST /api/auth/login
```json
Request:
{
  "identifier": "admin@aidmart.com",
  "password": "admin123",
  "role": "ADMIN"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  }
}
```

#### GET /api/auth/me
```json
Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... },
    "activeSessions": [ ... ],
    "sessionCount": 2
  }
}
```

#### POST /api/auth/register
```json
Request:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "password123",
  ...
}

Response:
{
  "success": true,
  "data": {
    "user": { id: "DI1234", ... },
    "session": { ... }
  }
}
```

### Admin

#### GET /api/admin/customers
```
Query params: ?status=PENDING&search=rahul&page=1&limit=10

Response:
{
  "success": true,
  "data": [ ... customers ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### PATCH /api/admin/customers
```json
Request:
{
  "customerId": "DI0024",
  "status": "ACTIVE"
}

Response:
{
  "success": true,
  "data": { ... updatedCustomer },
  "message": "Customer updated successfully"
}
```

## 🔒 Route Protection

### Customer Routes
- `/dashboard` - Requires customer login
- Redirects to `/login` if not authenticated
- Redirects to `/admin/dashboard` if admin

### Admin Routes
- `/admin/dashboard` - Requires admin login
- Redirects to `/login` if not authenticated
- Redirects to `/dashboard` if customer
- Menu items filtered by permissions

## 🧪 Demo Credentials

### Admin
- **Email**: admin@aidmart.com
- **Password**: admin123
- **Role**: Super Admin

### Customer
- **Mobile**: 9876543210
- **Password**: customer123
- **Status**: Active

### Pending Customer
- **Mobile**: 9876543211
- **Password**: customer123
- **Status**: Pending (requires admin approval)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Migration (Future)

The current implementation uses an in-memory mock database (`src/lib/db.ts`).

To connect to a real database:

1. **PostgreSQL with Prisma**
```bash
npm install @prisma/client prisma
npx prisma init
```

2. **MongoDB with Mongoose**
```bash
npm install mongoose
```

3. **DynamoDB**
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

Replace the `db` object methods with actual database queries.

## 🔧 Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=your_database_url

# JWT Secret (for production)
JWT_SECRET=your_super_secret_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Responsive Design

- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly interactions
- Tested on:
  - Desktop (1920px, 1440px, 1280px)
  - Tablet (768px)
  - Mobile (375px, 414px)

## 🎨 Theme

- **Primary**: Blue (#2563eb)
- **Admin Theme**: Dark sidebar
- **Customer Theme**: Light sidebar
- **Font**: Plus Jakarta Sans

---

**Made in Bharat 🇮🇳** | **Next.js 14** | **TypeScript** | **Tailwind CSS**
