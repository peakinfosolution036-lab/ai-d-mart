# Razorpay Integration & Registration Flow Documentation

This document summarizes the changes made to integrate Razorpay payments and enhance the user registration experience.

## 1. Razorpay Implementation
We have integrated the Razorpay SDK to handle secure payments within the application.

- **Library**: `razorpay` (Node.js SDK)
- **Client Hook**: `src/hooks/useRazorpay.ts` (Handles loading the script and opening the checkout modal)
- **configuration**: `src/lib/razorpay.ts` (Initializes the Razorpay instance)

## 2. API Endpoints
Created new routes to handle server-side Razorpay operations:

- `POST /api/razorpay/order`: Creates a Razorpay Order ID for a specific amount.
- `POST /api/razorpay/verify`: Validates the payment signature sent back by the client to ensure security.
- `POST /api/customer/wallet`: Updates the user's wallet balance in DynamoDB after successful payment verification.

## 3. Enhanced Registration Flow
The registration process now includes real payment and improved navigation:

- **Real Payment**: Replaced the "Simulated Payment" with a real Razorpay checkout interaction.
- **Auto-Login**: After successful registration and payment (or email verification), the system automatically logs the user in.
- **Auto-Redirect**: The user is instantly redirected to their `/dashboard` upon completion, removing the need for manual login.
- **Initial Benefits**: New users now receive their starting wallet balance and reward points (as defined in `REGISTRATION_FEE`) immediately upon registration.

## 4. Wallet "Add Money" Feature
Implemented a functional wallet recharge system in the Customer Dashboard:

- **Modal UI**: A clean, modern modal for entering or selecting recharge amounts (₹100, ₹500, ₹1000).
- **Payment Integration**: Uses Razorpay to process the recharge.
- **Real-time Balance Update**: After payment, the wallet balance and transaction history are updated instantly via the API.

## 5. Environment Variables
Add these to your `.env.local` to enable the integration:

```env
# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```
