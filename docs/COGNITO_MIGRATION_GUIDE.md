# AI D Mart - Cognito Authentication

## Authentication Overview

This application uses **AWS Cognito** for user authentication with the following features:
- User registration with email verification
- Login/Logout with access tokens stored in HTTP-only cookies
- Password reset functionality
- Admin and Customer roles

---

## Credentials

### Admin Account
- **Email:** `admin123@gmail.com`
- **Password:** `Admin123!`

---

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_AWS_REGION` | AWS region for DynamoDB | `ap-south-1` |
| `APP_AWS_ACCESS_KEY_ID` | AWS access key | `AKIAXXXXXXXX` |
| `APP_AWS_SECRET_ACCESS_KEY` | AWS secret key | `xxxxxxxx` |
| `COGNITO_REGION` | AWS region for Cognito | `ap-southeast-1` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `ap-southeast-1_XXXXXXX` |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito App Client ID | `4m8142r10p8xxxxxx` |
| `COGNITO_CLIENT_SECRET` | Cognito App Client Secret | `xxxxxxxx` |
| `DYNAMODB_USERS_TABLE` | DynamoDB users table name | `ai-d-mart-users` |
| `DYNAMODB_DATA_TABLE` | DynamoDB data table name | `ai-d-mart-data` |
| `RESEND_API_KEY` | Resend email API key | `re_XXXXXXX` |
| `RESEND_FROM_EMAIL` | Sender email address | `noreply@yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Your production URL | `https://yourdomain.vercel.app` |

---

## Vercel Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Migrate auth to Cognito"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see table above)

3. **Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from the table above
   - Make sure to add them for Production, Preview, and Development

4. **Deploy**
   - Vercel will automatically build and deploy

---

## Cognito Configuration Requirements

Your Cognito App Client must have:
- ✅ `ALLOW_USER_PASSWORD_AUTH` enabled
- ✅ Client secret (the `COGNITO_CLIENT_SECRET` env var)
- ✅ Email as sign-in alias

---

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/verify` | POST | Verify email with code |
| `/api/auth/resend-code` | POST | Resend verification code |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/change-password` | POST | Change password |

---

## Testing

### Test Login
```bash
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin123@gmail.com", "password": "Admin123!", "role": "ADMIN"}'
```

### Test Registration
```bash
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "mobile": "9876543210"
  }'
```

---

## Troubleshooting

### "Invalid email or password"
- Check that the Cognito User Pool ID and Client ID are correct
- Verify the user exists and is confirmed in Cognito
- Check password meets requirements (8+ chars, 1 number, 1 special char, 1 uppercase)

### "User pool client does not exist"
- Verify `NEXT_PUBLIC_COGNITO_CLIENT_ID` is correct
- Check the client exists in your Cognito User Pool

### Cookies not being set
- Ensure `NEXT_PUBLIC_APP_URL` is set to your production domain
- Check that your domain uses HTTPS
