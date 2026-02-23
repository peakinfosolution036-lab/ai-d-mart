# 🔐 Admin Credentials

## Admin User Successfully Created! ✅

Your admin user has been created in both Clerk and DynamoDB.

### Admin Login Credentials

```
Email:    admin@aidmart.com
Password: AiDMart#2024$SecureAdmin
Role:     ADMIN
User ID:  ADMMKJLY21
Clerk ID: user_38QWaK3MkyyTbgdEmGphY2xM2we
```

---

## How to Login

1. **Go to the login page**:
   - URL: `http://localhost:3000/login`

2. **Select Role**:
   - Click on "**Admin**" tab (not Customer)

3. **Enter Credentials**:
   - Email: `admin@aidmart.com`
   - Password: `Admin@123456`

4. **Login**:
   - Click "Sign In to Account"
   - You will be redirected to `/admin/dashboard`

---

## Admin Capabilities

As an admin, you can:

✅ View and manage all customers
✅ Approve/reject customer registrations
✅ Manage products, events, jobs, offers
✅ View all transactions and analytics
✅ System settings and configuration
✅ Full access to all features

---

## Creating Additional Users

### Create Another Admin
```bash
# Edit scripts/create-admin-simple.ts
# Change the email and password
# Then run:
npx tsx scripts/create-admin-simple.ts
```

### Create Regular Customer
1. Go to `http://localhost:3000/register`
2. Fill out the registration form
3. Customer will be created with status: PENDING
4. Login as admin to approve the customer

---

## Multi-Tenancy Explained

Your app has two user types:

### 1. ADMIN (You)
- Full system access
- Can see all customers
- Manage everything
- Dashboard: `/admin/dashboard`

### 2. CUSTOMER (Regular Users)
- Limited access
- Can only see their own data
- Dashboard: `/dashboard`
- Needs admin approval after registration

---

## Security Notes

⚠️ **Important**:
- Change the password after first login
- Don't share admin credentials
- Regularly review admin actions
- Keep Clerk API keys secure

---

## Testing the System

### Test Admin Login
```bash
# 1. Start the dev server
npm run dev

# 2. Go to http://localhost:3000/login
# 3. Select "Admin" role
# 4. Login with credentials above
```

### Test Customer Flow
```bash
# 1. Go to http://localhost:3000/register
# 2. Create a customer account
# 3. Login as admin
# 4. Approve the customer
# 5. Customer can now login
```

---

## Troubleshooting

### Can't login as admin?
- Make sure you selected "Admin" role (not Customer)
- Check email and password are correct
- Verify admin exists in Clerk dashboard

### Forgot admin password?
```bash
# Option 1: Reset in Clerk dashboard
# Option 2: Create new admin with different email
npx tsx scripts/create-admin-simple.ts
```

---

**Admin user ready to use!** 🎉

Login at: http://localhost:3000/login
