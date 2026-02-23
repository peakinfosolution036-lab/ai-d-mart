# Admin User & Multi-Tenancy Guide

## 🔐 Creating Admin User

### Quick Method - Run the Script

```bash
# Edit the admin credentials in scripts/create-admin-simple.ts first
# Then run:
tsx scripts/create-admin-simple.ts
```

The script will create an admin user with these default credentials:
- **Email**: `admin@aidmart.com`
- **Password**: `Admin@123456`
- **Role**: ADMIN

⚠️ **IMPORTANT**: Change the password in the script before running!

### Manual Method

If you prefer to create admin manually:

1. **Create user in Clerk Dashboard**:
   - Go to https://dashboard.clerk.com
   - Navigate to "Users" → "Create User"
   - Enter admin email and password
   - Copy the Clerk User ID

2. **Add to DynamoDB**:
   ```bash
   tsx scripts/create-admin-with-clerk.ts
   ```
   Enter the Clerk ID when prompted.

---

## 👥 Multi-Tenancy Concept in Your App

### What is Multi-Tenancy?

Your app uses a **role-based multi-tenancy model** where different user types (tenants) have different access levels:

### Tenant Types

#### 1. **ADMIN** (Super Admin)
- **Access**: Full system access
- **Capabilities**:
  - Manage all customers
  - Approve/reject customer registrations
  - View all transactions
  - Manage products, events, jobs, offers
  - System settings and configuration
  - View analytics and reports

#### 2. **CUSTOMER** (Regular Users)
- **Access**: Limited to their own data
- **Capabilities**:
  - Register and create account
  - Browse products, events, jobs
  - Make purchases
  - Manage own wallet
  - View own transaction history
  - Earn referral rewards

### How Multi-Tenancy Works

```
┌─────────────────────────────────────────┐
│         AI D Mart Application           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐      ┌──────────────┐ │
│  │   ADMIN     │      │   CUSTOMER   │ │
│  │  Dashboard  │      │   Dashboard  │ │
│  └─────────────┘      └──────────────┘ │
│        │                     │          │
│        ▼                     ▼          │
│  ┌─────────────────────────────────┐   │
│  │    Shared Services Layer        │   │
│  │  - Auth (Clerk)                 │   │
│  │  - Database (DynamoDB)          │   │
│  │  - Storage (AWS S3)             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Data Isolation Strategy

#### 1. **User Data Isolation**
```typescript
// Each user has unique ID and role
{
  id: "ADM0001",      // or "DI0001" for customer
  role: "ADMIN",      // or "CUSTOMER"
  clerkId: "user_xxx",
  email: "admin@aidmart.com"
}
```

#### 2. **DynamoDB Access Patterns**

**Admin Access**:
```typescript
// Can query ALL users
GSI1: ROLE#ADMIN → All admins
GSI1: ROLE#CUSTOMER → All customers
```

**Customer Access**:
```typescript
// Can only access own data
PK: USER#DI0001 → Own profile
PK: TRANSACTION#DI0001 → Own transactions
```

#### 3. **API Route Protection**

```typescript
// Admin-only routes
/api/admin/customers      → Requires role: ADMIN
/api/admin/master         → Requires role: ADMIN

// Customer routes
/api/customer/profile     → Requires role: CUSTOMER
/api/customer/wallet      → Requires role: CUSTOMER

// Public routes
/api/auth/login          → No auth required
/api/auth/register       → No auth required
```

---

## 🏗️ Multi-Tenancy Architecture

### Database Schema (DynamoDB)

```
Users Table:
┌─────────────────┬──────────────┬─────────────┬────────────┐
│ PK              │ SK           │ GSI1PK      │ GSI2PK     │
├─────────────────┼──────────────┼─────────────┼────────────┤
│ USER#ADM0001    │ PROFILE      │ ROLE#ADMIN  │ CLERK#xxx  │
│ USER#DI0001     │ PROFILE      │ ROLE#CUSTOMER│ CLERK#yyy  │
└─────────────────┴──────────────┴─────────────┴────────────┘
```

### Access Control Flow

```
1. User Login → Clerk Authentication
2. Get Clerk ID → Query DynamoDB by GSI2
3. Check Role → ADMIN or CUSTOMER
4. Set Session → Store role in cookie
5. Route Access → Middleware checks role
6. Data Access → Filter by user/role
```

---

## 🎯 Creating Different User Types

### 1. Create Admin User

**Using Script**:
```bash
tsx scripts/create-admin-simple.ts
```

**Default Credentials**:
- Email: `admin@aidmart.com`
- Password: `Admin@123456`

### 2. Create Customer User

**Via Registration Page**:
1. Go to `http://localhost:3000/register`
2. Fill out the registration form
3. User gets created with `CUSTOMER` role
4. Status: `PENDING` (needs admin approval)

**Via API**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+919876543210"
  }'
```

---

## 🔒 Security & Access Control

### Role-Based Access Control (RBAC)

```typescript
// Middleware protection
export const config = {
  matcher: [
    '/admin/:path*',      // Requires ADMIN role
    '/dashboard/:path*',  // Requires CUSTOMER role
  ],
};
```

### API Route Guards

```typescript
// In your API routes
const { userId } = await auth();
if (!userId) {
  return new Response('Unauthorized', { status: 401 });
}

// Get user from DynamoDB
const user = await getUserByClerkId(userId);

// Check role
if (user.role !== 'ADMIN') {
  return new Response('Forbidden', { status: 403 });
}
```

---

## 📊 User Lifecycle

### Admin User Lifecycle
```
Create in Clerk → Create in DynamoDB → Status: ACTIVE → Full Access
```

### Customer User Lifecycle
```
Register → Create in Clerk → Create in DynamoDB → Status: PENDING
         ↓
    Email Verification (Clerk)
         ↓
    Admin Approval Required
         ↓
    Status: ACTIVE → Customer Access
```

---

## 🛠️ Common Operations

### 1. List All Customers (Admin Only)
```typescript
const customers = await getUsersByRole('CUSTOMER');
```

### 2. Approve Customer Registration (Admin Only)
```typescript
await updateUserStatus(customerId, 'ACTIVE');
```

### 3. Check User Role
```typescript
const user = await getUserByClerkId(clerkId);
if (user.role === 'ADMIN') {
  // Admin operations
} else {
  // Customer operations
}
```

### 4. Create Multiple Admins
```bash
# Edit the script for each admin
tsx scripts/create-admin-simple.ts
```

---

## 🌐 Multi-Tenancy Benefits

1. **Data Isolation**: Each customer only sees their own data
2. **Role-Based Access**: Admins have full access, customers have limited access
3. **Scalability**: Single codebase serves all tenants
4. **Cost Effective**: Shared infrastructure with logical separation
5. **Easy Management**: Centralized admin dashboard

---

## 🚀 Testing Multi-Tenancy

### Test Admin Access
```bash
# 1. Create admin
tsx scripts/create-admin-simple.ts

# 2. Login at /login with "Admin" role
# 3. Should redirect to /admin/dashboard
# 4. Can view all customers, manage system
```

### Test Customer Access
```bash
# 1. Register at /register
# 2. Verify email via Clerk link
# 3. Login at /login with "Customer" role
# 4. Should redirect to /dashboard
# 5. Can only see own data
```

### Test Data Isolation
```bash
# 1. Login as Customer A
# 2. Try to access Customer B's data
# 3. Should be denied

# 1. Login as Admin
# 2. Can view all customer data
# 3. Full access granted
```

---

## 📝 Best Practices

1. **Always use role checks** in API routes
2. **Filter data by user ID** for customers
3. **Use Clerk for authentication**, DynamoDB for authorization
4. **Store sensitive data securely** in environment variables
5. **Audit admin actions** for compliance
6. **Regular security reviews** of access patterns

---

## ⚠️ Important Notes

- **Admin users** have full access to all data
- **Customer users** can only access their own data
- **Status field** controls user access (ACTIVE, PENDING, SUSPENDED, REJECTED)
- **Role field** determines dashboard and permissions
- **Multi-tenancy** is logical, not physical (shared database)

---

## 🆘 Troubleshooting

### Admin can't login
- Verify admin exists in both Clerk and DynamoDB
- Check role is set to 'ADMIN'
- Verify status is 'ACTIVE'

### Customer sees admin data
- This should never happen
- Check API route guards
- Verify role-based filtering in queries

### Can't create admin
- Check Clerk API key is correct
- Verify AWS credentials for DynamoDB
- Ensure CLERK_SECRET_KEY is in .env.local

---

**Your app uses a clean multi-tenant architecture with role-based access control!** 🎉
