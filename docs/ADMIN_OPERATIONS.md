# Admin Operations Guide

This document outlines the Master Administrative features available in the AI D Mart Admin Dashboard.

## 🔑 Master Control Center
Accessible via the **Admin Profile** tab, this center handles high-sensitivity operations.

### 1. Reset Passwords
- **Feature**: Force-update any user's password.
- **Backend API**: `POST /api/admin/master` with `{ action: 'RESET_PASSWORD' }`
- **Logic**: Uses AWS Cognito `AdminSetUserPassword` to override security.

### 2. Role Assignment
- **Feature**: Change user roles between `CUSTOMER` and `ADMIN`.
- **Backend API**: `POST /api/admin/master` with `{ action: 'ASSIGN_ROLE' }`
- **Logic**:
    - Updates DynamoDB `GSI1PK` (ROLE#...) for indexing.
    - Moves user between Cognito Groups (`admins` / `customers`).

### 3. Business Verification
- **Feature**: Verify "My Business" profiles to enable merchant capabilities, bookings, and verified badges.
- **Backend API**: `POST /api/admin/businesses/verify` 
- **Logic**: 
    - Sets business `status` to `verified`.
    - Sets `isVerified` to `true`.
    - Records `verificationDate`.
    - Enables the customer to manage bookings and leads.

### 4. Global Suspension
- **Feature**: Suspend or ban malicious accounts.
- **Backend API**: `POST /api/admin/master` with `{ action: 'SUSPEND_USER' }`
- **Logic**: 
    - Sets DynamoDB status to `SUSPENDED`.
    - Disables account in Cognito (`AdminDisableUser`).

## 🛡️ Security Implementation
- **Role Enforcement**: Every API route verifies the calling user has the `ADMIN` role in both DynamoDB and Cognito tokens.
- **Audit Logs**: (Planned) All master actions should be logged to the `ai-d-mart-data` table under `AUDIT#` prefix.

## 🚀 Testing
You can test these features by:
1. Navigating to **Admin Profile**.
2. Opening the **Master Control Center**.
3. Using the **Assign Role** or **Reset Password** buttons (Note: UI popups are hooked to tab navigation for queue management).
