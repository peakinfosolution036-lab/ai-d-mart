#!/usr/bin/env tsx
/**
 * Update Admin Password in Clerk
 */

const ADMIN_EMAIL = 'admin@aidmart.com';
const NEW_PASSWORD = 'AiDMart#2024$SecureAdmin';

async function updateAdminPassword() {
    console.log('\n🔧 Updating Admin Password in Clerk\n');

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
        throw new Error('CLERK_SECRET_KEY not found in environment variables');
    }

    try {
        // Get user by email
        const getUserResponse = await fetch(
            `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(ADMIN_EMAIL)}`,
            {
                headers: {
                    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const users = await getUserResponse.json();

        if (!users || users.length === 0) {
            throw new Error('Admin user not found in Clerk');
        }

        const userId = users[0].id;
        console.log(`Found admin user: ${userId}`);

        // Update password
        const updateResponse = await fetch(
            `https://api.clerk.com/v1/users/${userId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: NEW_PASSWORD,
                    skip_password_checks: false,
                })
            }
        );

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(`Failed to update password: ${JSON.stringify(error)}`);
        }

        console.log('✅ Admin password updated successfully in Clerk!\n');
        console.log('New Credentials:');
        console.log('━'.repeat(60));
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${NEW_PASSWORD}`);
        console.log('━'.repeat(60));
        console.log('\n🔑 You can now login at: http://localhost:3000/login\n');

    } catch (error) {
        console.error('❌ Error updating password:', error);
        throw error;
    }
}

updateAdminPassword()
    .then(() => {
        console.log('✅ Script completed successfully\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
