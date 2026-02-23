#!/usr/bin/env tsx
/**
 * Manually verify admin email in Clerk
 */

async function verifyAdminEmail() {
    console.log('\n✉️ Verifying Admin Email in Clerk\n');

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    const ADMIN_EMAIL = 'admin@aidmart.com';

    if (!CLERK_SECRET_KEY) {
        throw new Error('CLERK_SECRET_KEY not found');
    }

    try {
        // Get user
        console.log('1. Finding admin user...');
        const getUserResponse = await fetch(
            `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(ADMIN_EMAIL)}`,
            {
                headers: { 'Authorization': `Bearer ${CLERK_SECRET_KEY}` }
            }
        );

        const users = await getUserResponse.json();
        if (!users || users.length === 0) {
            throw new Error('Admin user not found');
        }

        const user = users[0];
        console.log(`   Found user: ${user.id}`);

        // Get email address ID
        const emailAddress = user.email_addresses.find((e: any) => e.email_address === ADMIN_EMAIL);
        if (!emailAddress) {
            throw new Error('Email address not found');
        }

        console.log(`   Email ID: ${emailAddress.id}`);
        console.log(`   Current status: ${emailAddress.verification?.status || 'unverified'}`);

        if (emailAddress.verification?.status === 'verified') {
            console.log('   ✅ Email already verified');
            return;
        }

        // Verify the email
        console.log('2. Verifying email...');
        const verifyResponse = await fetch(
            `https://api.clerk.com/v1/email_addresses/${emailAddress.id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verified: true
                })
            }
        );

        if (!verifyResponse.ok) {
            const error = await verifyResponse.json();
            console.log('   Response:', JSON.stringify(error, null, 2));
            throw new Error('Failed to verify email');
        }

        console.log('   ✅ Email verified successfully!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

verifyAdminEmail()
    .then(() => {
        console.log('✅ Admin email is now verified\n');
        console.log('Try logging in again at: http://localhost:3000/login\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
