#!/usr/bin/env tsx
/**
 * Delete and recreate admin user in Clerk
 */

const ADMIN_CONFIG = {
    email: 'admin@aidmart.com',
    password: 'AiDMart#2024$SecureAdmin',
    name: 'Super Admin',
};

async function deleteAndRecreateAdmin() {
    console.log('\n🔧 Delete and Recreate Admin User\n');

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
        throw new Error('CLERK_SECRET_KEY not found');
    }

    try {
        // Step 1: Find existing user
        console.log('1. Finding existing admin user...');
        const getUserResponse = await fetch(
            `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(ADMIN_CONFIG.email)}`,
            {
                headers: {
                    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                }
            }
        );

        const users = await getUserResponse.json();

        if (users && users.length > 0) {
            const userId = users[0].id;
            console.log(`   Found user: ${userId}`);

            // Step 2: Delete the user
            console.log('2. Deleting existing user...');
            await fetch(
                `https://api.clerk.com/v1/users/${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                    }
                }
            );
            console.log('   ✅ User deleted');
        } else {
            console.log('   No existing user found');
        }

        // Step 3: Create new user
        console.log('3. Creating new admin user...');
        const createResponse = await fetch(
            'https://api.clerk.com/v1/users',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email_address: [ADMIN_CONFIG.email],
                    username: 'admin',
                    password: ADMIN_CONFIG.password,
                    first_name: ADMIN_CONFIG.name.split(' ')[0],
                    last_name: ADMIN_CONFIG.name.split(' ').slice(1).join(' '),
                    skip_password_checks: true,
                    skip_password_requirement: false,
                })
            }
        );

        if (!createResponse.ok) {
            const error = await createResponse.json();
            throw new Error(`Failed to create user: ${JSON.stringify(error)}`);
        }

        const newUser = await createResponse.json();
        console.log('   ✅ New user created');
        console.log(`   Clerk ID: ${newUser.id}`);

        console.log('\n✅ Admin user recreated successfully!\n');
        console.log('Credentials:');
        console.log('━'.repeat(60));
        console.log(`Email: ${ADMIN_CONFIG.email}`);
        console.log(`Password: ${ADMIN_CONFIG.password}`);
        console.log(`Clerk ID: ${newUser.id}`);
        console.log('━'.repeat(60));
        console.log('\nNow run: npx tsx scripts/create-admin-simple.ts');
        console.log('to create the DynamoDB profile\n');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

deleteAndRecreateAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
