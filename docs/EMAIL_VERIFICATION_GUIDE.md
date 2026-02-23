# Email Verification Guide

## How Email Verification Works with Clerk

When a user registers, Clerk automatically sends a verification email. Here's what happens:

### Registration Flow:
1. User fills out registration form
2. User is created in Clerk
3. **Clerk automatically sends verification email** (not our app)
4. User profile is created in DynamoDB with status: `PENDING`

### Email Verification Options:

#### Option 1: Email Link (Default - Recommended)
Clerk sends an email with a **clickable link**. When clicked:
- User's email is verified in Clerk
- User can then login
- Backend will check Clerk verification status

#### Option 2: Email Code (6-digit)
Clerk can send a 6-digit code that users enter manually.

## Current Issue

The verification email is not arriving because of one of these reasons:

### 1. Email in Spam/Junk Folder
- Check spam/junk folder for email from Clerk
- Email will be from: `noreply@clerk.dev` or similar

### 2. Clerk Email Settings Not Configured
- Clerk's free tier uses their default email service
- Emails might be delayed or blocked

### 3. Email Verification Strategy Not Set

## Solution Options

### Quick Fix: Skip Email Verification for Testing

You can configure Clerk to allow unverified emails to login:

1. Go to: https://dashboard.clerk.com
2. Navigate to **Email, Phone, Username** settings
3. Under **Email address**, click **Settings**
4. Toggle **"Require verification"** to OFF

**OR**

### Better Fix: Configure Clerk Email Settings

1. Go to: https://dashboard.clerk.com
2. Navigate to **Customization** → **Email**
3. Check email templates are enabled
4. Test by clicking **"Send test email"**

### Alternative: Use Magic Links

Instead of email verification codes, you can:

1. Configure Clerk to use **Email Links** (magic links)
2. Users click link in email → automatically verified
3. No code entry needed

## For Development/Testing

### Bypass Email Verification:
You can manually verify users in Clerk Dashboard:

1. Go to: https://dashboard.clerk.com
2. Click **Users**
3. Find the user (e.g., `arunachalamk015@gmail.com`)
4. Click on the user
5. Under **Email addresses**, click the email
6. Click **"Mark as verified"**

## Check Email Status

To see if Clerk sent the email:

1. Go to Clerk Dashboard
2. Click **Users**
3. Find the user
4. Check **Email addresses** section
5. Status will show:
   - ✅ **Verified** - Email confirmed
   - ⏳ **Unverified** - Waiting for verification
   - 📧 **Verification pending** - Email sent

## Common Issues

### "Email not received"
- **Check spam folder**
- **Wait 5-10 minutes** (emails can be delayed)
- **Check email address is correct** in Clerk Dashboard
- **Resend verification** from Clerk Dashboard

### "Verification link expired"
- Links expire after 24 hours
- Resend verification from Clerk Dashboard or login page

### "Can't login even after clicking link"
- Make sure you clicked the link in the email
- Check Clerk Dashboard shows email as "Verified"
- If still issues, check backend logs

## Testing Email Verification

### Test with a real email:
```
1. Register with your real email
2. Check inbox (and spam)
3. Click verification link in email
4. Should auto-verify and redirect
```

### Test without email verification:
```
1. Disable "Require verification" in Clerk
2. Register
3. Login immediately (no verification needed)
```

## Current Configuration

Your app is set to:
- ✅ Clerk handles email verification
- ✅ Emails sent from Clerk's service
- ✅ Verification link strategy (default)
- ⏳ Waiting for email to arrive

## Next Steps

**For immediate testing**, I recommend:

1. **Go to Clerk Dashboard** → Email settings
2. **Disable** "Require verification" temporarily
3. Users can register and login immediately
4. Re-enable when ready for production

**For production**, configure proper email:

1. Use Clerk's email service (default)
2. Or configure custom SMTP in Clerk
3. Or use email service like SendGrid

---

**Need Help?**

If emails are still not arriving:
1. Check Clerk Dashboard → Users → [User] → Email status
2. Manually verify the user in Clerk Dashboard
3. Or disable email verification requirement for testing
