# AWS Amplify Deployment Fixes

## Issues Fixed

### 1. Admin Orders — Missing Auth (CRITICAL)
**File:** `src/app/api/admin/orders/route.ts`
Added `verifyAdminAccess` check. Previously any unauthenticated user could read all orders.

### 2. File Upload — Filesystem → S3 (CRITICAL)
**File:** `src/app/api/upload/route.ts`
Rewrote to use `@aws-sdk/client-s3`. Amplify Lambda has an ephemeral filesystem; local file writes are lost after each request.
**New env var required:** `S3_UPLOAD_BUCKET=your-bucket-name`

### 3. amplify.yml — Build Config (CRITICAL)
**File:** `amplify.yml` (root)
Created Amplify build spec for Next.js. Without this, Amplify may fail to build or deploy correctly.

### 4. DynamoDB Client Consolidation (HIGH)
**Files (15 routes):**
- `api/lucky-draw/subscription`, `api/lucky-draw/products`, `api/lucky-draw/bookings`, `api/lucky-draw/winners`
- `api/prime/membership`, `api/prime/lucky-draw`, `api/prime/wallets`
- `api/referrals`
- `api/events/exclusive`, `api/events/passes`
- `api/admin/lucky-draw`, `api/admin/shop`, `api/admin/prime`, `api/admin/products`
- `api/shop/products`

All were creating separate `DynamoDBClient` instances. Now all import and use the centralized `docClient` from `@/lib/dynamodb`. Also exported `docClient` from `src/lib/dynamodb.ts`.

### 5. next.config.js — Production Hardening (HIGH)
- Added S3 image domains
- Added security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`

### 6. Health Check Endpoint (MEDIUM)
**File:** `src/app/api/health/route.ts`
Created `/api/health` endpoint. Amplify and load balancers use this to verify the service is alive.

---

## Required Environment Variables in Amplify Console

Set these under **App settings → Environment variables** in the Amplify Console:

```
APP_AWS_ACCESS_KEY_ID
APP_AWS_SECRET_ACCESS_KEY
APP_AWS_REGION              = ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
COGNITO_REGION              = ap-south-1
COGNITO_CLIENT_SECRET
DYNAMODB_USERS_TABLE        = ai-d-mart-users
DYNAMODB_DATA_TABLE         = ai-d-mart-data
S3_UPLOAD_BUCKET            = your-s3-bucket-name
GMAIL_EMAIL                 (or RESEND_API_KEY)
GMAIL_APP_PASSWORD          (if using Gmail)
NEXT_PUBLIC_APP_URL         = https://your-amplify-domain.amplifyapp.com
```

---

## S3 Bucket Setup (for uploads)

1. Create an S3 bucket in `ap-south-1`
2. Set CORS policy:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT", "POST", "GET"],
  "AllowedOrigins": ["https://your-amplify-domain.amplifyapp.com"],
  "ExposeHeaders": []
}]
```
3. Give your IAM user (APP_AWS_ACCESS_KEY_ID) `s3:PutObject` and `s3:GetObject` on the bucket.

---

## DynamoDB Tables Required

These tables must exist before the app works:
- `ai-d-mart-users` (with GSI1, GSI2)
- `ai-d-mart-data`
- `ai-d-mart-products`
- `ai-d-mart-prime-memberships`
- `ai-d-mart-wallets`
- `ai-d-mart-referrals`
- `ai-d-mart-lucky-draw`
- `ai-d-mart-prime-rewards`
- `LuckyDrawProducts`, `NumberBookings`, `LuckyDrawSubscriptions`, `LuckyDrawWinners`, `DrawResults`
- `exclusive-events`, `event-passes`, `event-registrations`
- `referrals`, `user-points`, `point-transactions`

Run `npm run create-tables` locally before first deploy.

---

## Deploy Steps

1. Push code to GitHub
2. Connect repo in AWS Amplify Console
3. Set all environment variables above
4. Deploy — Amplify will use `amplify.yml` automatically
5. Verify `/api/health` returns `{"status":"ok"}`
6. Test login (customer + admin)
7. Test registration flow
