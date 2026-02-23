# AI D Mart — Claude Code Reference

## Project Overview

**AI D Mart** is a full-stack Digital India Platform by **Devaramane Events and Industries**, connecting rural India to the digital economy through FinTech, E-Commerce, and utility services.

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS 3.4 + Framer Motion 12
- **Auth**: AWS Cognito Identity Provider
- **Database**: AWS DynamoDB (Document Client)
- **Email**: Resend / Nodemailer (Gmail)
- **Icons**: Lucide React
- **Font**: Plus Jakarta Sans

---

## Project Structure

```
ai-d-mart/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with AuthContext + DataContext
│   │   ├── page.tsx                # Landing page → <LandingPage />
│   │   ├── globals.css             # Tailwind base + custom CSS
│   │   ├── login/page.tsx          # Unified login (Admin/Customer)
│   │   ├── register/page.tsx       # Multi-step customer registration
│   │   ├── dashboard/page.tsx      # Customer dashboard (large component)
│   │   ├── about/page.tsx          # About page
│   │   ├── forgot-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── shop/page.tsx           # E-commerce shop
│   │   ├── prime/page.tsx          # Prime membership page
│   │   ├── lucky-draw/page.tsx     # Lucky draw feature
│   │   ├── referral/page.tsx       # Referral program
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx  # Admin control panel
│   │   │   ├── dashboard/Exclusive-Events/page.tsx
│   │   │   ├── lucky-draw/page.tsx
│   │   │   ├── referrals/page.tsx
│   │   │   └── shop-inventory/page.tsx
│   │   └── api/                    # All API routes (server-side)
│   │       ├── auth/               # login, logout, register, verify, me, etc.
│   │       ├── admin/              # Admin management endpoints
│   │       ├── customer/           # Customer-specific endpoints
│   │       ├── shop/               # Shop products
│   │       ├── events/             # Events, passes, bookings, exclusive
│   │       ├── jobs/               # Job listings & applications
│   │       ├── lucky-draw/         # Lucky draw CRUD
│   │       ├── prime/              # Prime membership
│   │       ├── referrals/          # Referral system
│   │       ├── upload/             # File uploads
│   │       ├── search/             # Global search
│   │       ├── reviews/            # Product reviews
│   │       ├── reports/            # Analytics
│   │       └── debug/aws-test/     # AWS connectivity test
│   │
│   ├── components/
│   │   ├── AppLayout.tsx           # Navigation / shell layout
│   │   ├── LandingPage.tsx         # Hero, services, testimonials sections
│   │   ├── Shop.tsx                # E-commerce UI
│   │   ├── ShopShortcode.tsx       # Embeddable shop widget
│   │   ├── Gallery.tsx             # Image gallery
│   │   ├── ExclusiveEvents.tsx     # Exclusive events showcase
│   │   ├── LuckyDrawWinners.tsx    # Winners display
│   │   ├── PrimeMembership.tsx     # Prime signup/info
│   │   ├── PrimeDashboard.tsx      # Prime member dashboard
│   │   ├── ReferralPage.tsx        # Referral signup/tracking
│   │   ├── ReferralDashboard.tsx   # Referral stats
│   │   ├── Testimonials.tsx        # Customer testimonials
│   │   └── ui/
│   │       ├── DatePicker.tsx
│   │       ├── Dropdown.tsx
│   │       └── Toast.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state: user, role, login/logout
│   │   └── DataContext.tsx         # App data: events, products, jobs, offers
│   │
│   ├── lib/
│   │   ├── cognito.ts              # AWS Cognito wrapper (signIn, signUp, etc.)
│   │   ├── dynamodb.ts             # All DynamoDB operations (~1335 lines)
│   │   ├── auth.ts                 # Auth helpers (JWT, session cookies)
│   │   ├── admin-auth.ts           # Admin-specific auth checks
│   │   ├── db.ts                   # Database abstraction layer
│   │   ├── email.ts                # Email service abstraction
│   │   ├── email-gmail.ts          # Gmail/Nodemailer implementation
│   │   ├── email-resend.ts         # Resend implementation
│   │   ├── rate-limit.ts           # Request rate limiting
│   │   └── exportUtils.ts          # Analytics export helpers
│   │
│   ├── types/index.ts              # All TypeScript interfaces & enums
│   ├── constants/index.ts          # App constants (fees, dashboard items)
│   └── middleware.ts               # Next.js route protection middleware
│
├── scripts/                        # Utility & setup scripts (run with ts-node/tsx)
│   ├── dynamodb-tables/            # Table creation scripts per entity
│   ├── create-admin.ts             # Create admin user in Cognito + DynamoDB
│   ├── create-admin-simple.ts
│   ├── create-admin-user.ts
│   ├── seed-data.ts                # Seed initial platform data
│   ├── seed-admin.ts               # Seed admin user
│   ├── seed-shop-products.ts       # Seed shop products
│   ├── add-sample-products.ts
│   ├── add-customer-dynamodb.ts
│   ├── create-customer.ts
│   ├── setup-shop.ts
│   ├── update-existing-products.ts
│   ├── list-products.ts
│   ├── scan-all-items.ts
│   ├── fix-customer-cognito.ts
│   ├── test-auth-flow.ts
│   ├── test-auth.sh
│   ├── test-app.ts
│   ├── add-env-vars.sh             # Add env vars to Vercel
│   ├── deploy-vercel.sh            # Vercel deployment helper
│   ├── update-all-envs.sh          # Update all env files
│   └── create_new_repo.sh          # Git repo creation helper
│
├── public/                         # Static assets served at /
│   ├── bento_global.png
│   ├── devaramane_venue_hero.png
│   ├── hero-video.mp4
│   ├── service_b2b.png
│   ├── service_events.png
│   ├── service_hospitality.png
│   ├── service_media.png
│   ├── partners/                   # Partner logo images
│   └── [event/venue photos]        # Wedding & event imagery
│
├── docs/                           # All project documentation
│   ├── ARCHITECTURE.md
│   ├── MIGRATION_SUMMARY.md
│   ├── CONVERSION_COMPLETE.md
│   ├── razorpay-integration.md
│   ├── ADMIN_OPERATIONS.md
│   ├── EVENTS_SYSTEM.md
│   ├── OFFERS_PROMOTIONS_GUIDE.md
│   ├── REPORTS_PROMOTIONS_SETTINGS.md
│   ├── SEARCH_SYSTEM.md
│   ├── ADMIN_AND_MULTITENANCY_GUIDE.md
│   ├── ADMIN_CREDENTIALS.md
│   ├── COGNITO_MIGRATION_GUIDE.md
│   ├── EMAIL_VERIFICATION_GUIDE.md
│   ├── LUCKY_DRAW_FEATURE.md
│   └── RESPONSIVE_SUMMARY.md
│
├── CLAUDE.md                       # This file
├── README.md                       # Setup & getting started
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vercel.json
├── .env.example                    # Environment variable template
└── .gitignore
```

---

## Architecture

### Dual Portal System

| Portal | URL | Role |
|--------|-----|------|
| Customer | `/dashboard` | `CUSTOMER` |
| Admin | `/admin/dashboard` | `ADMIN` |

### Authentication Flow

```
Login Form → POST /api/auth/login → Cognito InitiateAuth
                                  → DynamoDB lookup (GSI2 by cognitoSub)
                                  → Set HttpOnly cookie (accessToken)
                                  → Return user profile
```

### State Management

- **`AuthContext`** (`src/context/AuthContext.tsx`) — user, role, isLoggedIn, login(), logout()
- **`DataContext`** (`src/context/DataContext.tsx`) — events, products, jobs, offers, rewards (shared fetch)

### DynamoDB Schema

**Users Table** (`ai-d-mart-users`):
```
PK: "USER#DI0023"     SK: "PROFILE"
GSI1PK: "ROLE#CUSTOMER"  GSI1SK: "STATUS#ACTIVE#DI0023"
GSI2PK: "COGNITO#<cognitoSub>"  GSI2SK: "PROFILE"
```

**Data Table** (`ai-d-mart-data`):
```
PK: "PRODUCT#prod_123"  SK: "DATA"
type: "product"
```

Entity types stored in the data table: `PRODUCT`, `EVENT`, `EVENT_BOOKING`, `JOB`, `JOB_APPLICATION`, `OFFER`, `PROMOTION`, `BUSINESS`, `ORDER`, `REVIEW`, `TRANSACTION`, `NOTIFICATION`, `CAMPAIGN`, `LUCKY_DRAW_*`, `PRIME_*`, `REFERRAL`

---

## Key Types (`src/types/index.ts`)

```typescript
enum UserRole { ADMIN = 'ADMIN', CUSTOMER = 'CUSTOMER', GUEST = 'GUEST' }
enum UserStatus { ACTIVE, PENDING, SUSPENDED, REJECTED }
enum AdminPermission {
  MANAGE_USERS, MANAGE_PRODUCTS, MANAGE_ORDERS, MANAGE_EVENTS,
  MANAGE_JOBS, MANAGE_OFFERS, MANAGE_REWARDS, VIEW_REPORTS,
  MANAGE_SETTINGS, SUPER_ADMIN
}

interface CustomerUser {
  id: string;            // e.g. "DI0023"
  email: string;
  mobile: string;
  fullName: string;
  role: 'CUSTOMER';
  status: UserStatus;
  walletBalance: number;
  rewardPoints: number;
  kycVerified: boolean;
  cognitoSub?: string;
}

interface AdminUser {
  id: string;            // e.g. "ADM0001"
  email: string;
  role: 'ADMIN';
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}
```

---

## API Endpoints

### Auth (`/api/auth/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (admin or customer) |
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/verify` | Email verification |
| POST | `/api/auth/resend-code` | Resend verification code |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| POST | `/api/auth/change-password` | Change password (logged in) |
| GET  | `/api/auth/me` | Session check / current user |
| POST | `/api/auth/logout` | Logout current session |
| POST | `/api/auth/logout-all` | Logout all sessions |

### Admin (`/api/admin/*`)
- Users, Customers, Products, Orders, Events, Jobs, Offers, Promotions, Businesses, Lucky Draw, Prime, Reports, Notifications, Settings, Stores, Transactions, Seed

### Customer (`/api/customer/*`)
- Profile, Orders, Cart, Notifications, Offers, Promotions, Business, Settings, Data

### Public / Feature Routes
- `/api/shop/products` — product listing
- `/api/events` — events, bookings, passes, exclusive
- `/api/jobs` — listings & applications
- `/api/lucky-draw` — subscriptions, bookings, winners
- `/api/prime/membership` — prime plans
- `/api/referrals` — referral tracking
- `/api/search` — global search
- `/api/upload` — file uploads (S3)
- `/api/reviews` — product reviews
- `/api/reports` — analytics

---

## Environment Variables

Required in `.env.local`:

```bash
# AWS Credentials
APP_AWS_ACCESS_KEY_ID=
APP_AWS_SECRET_ACCESS_KEY=
APP_AWS_REGION=ap-south-1

# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
COGNITO_REGION=ap-south-1
COGNITO_CLIENT_SECRET=

# DynamoDB
DYNAMODB_USERS_TABLE=ai-d-mart-users
DYNAMODB_DATA_TABLE=ai-d-mart-data

# Email (choose one)
GMAIL_EMAIL=
GMAIL_APP_PASSWORD=
RESEND_API_KEY=

# Payments (optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Development Commands

```bash
# Dev
npm run dev               # http://localhost:3000

# Build
npm run build
npm start

# Lint
npm run lint

# Database setup (run once)
npm run create-tables     # Create all DynamoDB tables
npm run create-admin      # Create initial admin user
npm run seed              # Seed sample data
npm run seed-shop         # Seed shop products

# Utilities
npm run list-products     # List all products in DynamoDB
npm run scan-all          # Scan all DynamoDB items
```

---

## Code Patterns

### API Route
```typescript
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await dynamodb.query({ ... });
  return NextResponse.json({ success: true, data });
}
```

### Client Component
```typescript
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  // ...
}
```

### DynamoDB Query
```typescript
import { docClient } from '@/lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const result = await docClient.send(new QueryCommand({
  TableName: process.env.DYNAMODB_USERS_TABLE,
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: { ':pk': 'USER#DI0023' }
}));
```

---

## Features Summary

| Feature | Customer | Admin |
|---------|----------|-------|
| Shop / E-Commerce | Browse, cart, order | Manage products, inventory |
| Events | Book tickets, passes | Create, manage events |
| Jobs | Apply for jobs | Post, manage jobs |
| Lucky Draw | Subscribe, book numbers | Manage draws, pick winners |
| Prime Membership | Subscribe | Manage plans |
| Referrals | Share code, track rewards | Monitor referrals |
| Wallet | View balance | Manage transactions |
| KYC | Submit documents | Verify/approve |
| Notifications | Receive | Broadcast |
| Reports | Personal history | Business analytics |

---

## Registration Fee Structure

| Component | Amount |
|-----------|--------|
| Base fee (75% off ₹5,000) | ₹1,250 |
| GST (18%) | ₹225 |
| **Total** | **₹1,475** |
| Referral bonus | ₹500 |
| Wallet credit | ₹100 |
| Reward points | 150 pts |

---

## Security

- **HttpOnly cookies** for access/refresh tokens
- **SameSite + Secure** flags in production
- **RBAC** — admin permissions checked per-route
- **Cognito SecretHash** for client authentication
- **Rate limiting** via `src/lib/rate-limit.ts`
- **Input validation** at API boundaries
- Route protection in `src/middleware.ts`

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Pages | kebab-case | `forgot-password/page.tsx` |
| Components | PascalCase | `AppLayout.tsx` |
| Utilities | camelCase | `auth.ts`, `dynamodb.ts` |
| Types | PascalCase interfaces | `CustomerUser`, `EventItem` |
| API routes | kebab-case dirs | `api/lucky-draw/route.ts` |

---

## Import Order Convention

1. React imports
2. Next.js imports (`next/navigation`, `next/image`)
3. Third-party libraries (`framer-motion`, `lucide-react`)
4. Internal components (`@/components/...`)
5. Internal utilities (`@/lib/...`, `@/types/...`, `@/context/...`)
6. Relative imports

---

## Known Issues / Backlog

- [ ] Comprehensive error boundaries on all pages
- [ ] Global loading state / skeleton screens
- [ ] Redis caching layer
- [ ] Real-time notifications (WebSocket/SSE)
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright / Cypress)
- [ ] PWA support
- [ ] Dark mode

---

## Deployment

**Vercel** (recommended):
```bash
# Set env vars first
vercel env add NEXT_PUBLIC_COGNITO_USER_POOL_ID production
# ... other vars

vercel --prod
```

**Manual**:
```bash
npm run build
npm start  # PORT=3000
```

See `scripts/deploy-vercel.sh` for automated deployment helper.

---

## Documentation Index (`docs/`)

| File | Topic |
|------|-------|
| `ARCHITECTURE.md` | System design & data flow |
| `ADMIN_OPERATIONS.md` | Admin dashboard guide |
| `EVENTS_SYSTEM.md` | Events feature docs |
| `OFFERS_PROMOTIONS_GUIDE.md` | Offers & campaigns |
| `REPORTS_PROMOTIONS_SETTINGS.md` | Analytics & settings |
| `SEARCH_SYSTEM.md` | Global search implementation |
| `LUCKY_DRAW_FEATURE.md` | Lucky draw system |
| `ADMIN_AND_MULTITENANCY_GUIDE.md` | Multi-tenant admin setup |
| `ADMIN_CREDENTIALS.md` | Admin account setup |
| `COGNITO_MIGRATION_GUIDE.md` | Clerk → Cognito migration |
| `EMAIL_VERIFICATION_GUIDE.md` | Email verification setup |
| `RESPONSIVE_SUMMARY.md` | Responsive design notes |
| `razorpay-integration.md` | Payment gateway (Razorpay) |
| `MIGRATION_SUMMARY.md` | Vite → Next.js migration |
| `CONVERSION_COMPLETE.md` | Migration completion notes |

---

*Made in Bharat | Devaramane Events and Industries | Next.js 14 + AWS*
