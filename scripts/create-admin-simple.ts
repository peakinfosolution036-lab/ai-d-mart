#!/usr/bin/env tsx
/**
 * Simple Admin User Creator
 * Creates admin user in both Clerk and DynamoDB
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Admin credentials - CHANGE THESE
const ADMIN_CONFIG = {
    email: 'admin@aidmart.com',
    password: 'AiDMart#2024$SecureAdmin',  // Strong unique password
    name: 'Super Admin',
    phone: '+919876543210'
};

// Initialize DynamoDB client
const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    }
});

const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true
    }
});

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'ai-d-mart-users';

function generateUserId(role: 'ADMIN' | 'CUSTOMER'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = role === 'ADMIN' ? 'ADM' : 'DI';
    return `${prefix}${timestamp}${random}`.substring(0, 10).toUpperCase();
}

async function createAdminInClerk() {
    console.log('\n📧 Creating admin user in Clerk...');

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
        throw new Error('CLERK_SECRET_KEY not found in environment variables');
    }

    try {
        const response = await fetch('https://api.clerk.com/v1/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_address: [ADMIN_CONFIG.email],
                username: ADMIN_CONFIG.email.split('@')[0],
                password: ADMIN_CONFIG.password,
                first_name: ADMIN_CONFIG.name.split(' ')[0],
                last_name: ADMIN_CONFIG.name.split(' ').slice(1).join(' '),
                skip_password_checks: true,
                skip_password_requirement: false,
            }),
            // Note: skip_password_checks only works on user creation, not on login
        });

        if (!response.ok) {
            const error = await response.json();

            // Check if user already exists
            if (error.errors?.[0]?.code === 'form_identifier_exists') {
                console.log('⚠️  User already exists in Clerk, fetching existing user...');

                // Get existing user by email
                const getUserResponse = await fetch(
                    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(ADMIN_CONFIG.email)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                const users = await getUserResponse.json();
                if (users && users.length > 0) {
                    return users[0].id;
                }
            }

            throw new Error(`Clerk API error: ${JSON.stringify(error)}`);
        }

        const userData = await response.json();
        console.log('✅ Admin user created in Clerk');
        return userData.id;

    } catch (error) {
        console.error('❌ Error creating admin in Clerk:', error);
        throw error;
    }
}

async function createAdminInDynamoDB(clerkId: string) {
    console.log('\n💾 Creating admin user in DynamoDB...');

    const adminId = generateUserId('ADMIN');

    const adminUser = {
        PK: `USER#${adminId}`,
        SK: `PROFILE`,
        id: adminId,
        clerkId: clerkId,
        cognitoSub: clerkId, // For backwards compatibility
        email: ADMIN_CONFIG.email,
        name: ADMIN_CONFIG.name,
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: ADMIN_CONFIG.phone,
        walletBalance: 0,
        kycVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // GSI1 for role-based queries
        GSI1PK: 'ROLE#ADMIN',
        GSI1SK: `STATUS#ACTIVE#${adminId}`,

        // GSI2 for Clerk ID lookup
        GSI2PK: `CLERK#${clerkId}`,
        GSI2SK: 'PROFILE',
    };

    try {
        const command = new PutCommand({
            TableName: USERS_TABLE,
            Item: adminUser,
        });

        await docClient.send(command);
        console.log('✅ Admin user created in DynamoDB');

        return adminUser;

    } catch (error) {
        console.error('❌ Error creating admin in DynamoDB:', error);
        throw error;
    }
}

async function main() {
    console.log('\n🔧 AI D Mart - Admin User Creator\n');
    console.log('Creating admin user with the following details:');
    console.log('━'.repeat(60));
    console.log(`Email: ${ADMIN_CONFIG.email}`);
    console.log(`Password: ${ADMIN_CONFIG.password}`);
    console.log(`Name: ${ADMIN_CONFIG.name}`);
    console.log(`Phone: ${ADMIN_CONFIG.phone}`);
    console.log('━'.repeat(60));

    try {
        // Step 1: Create in Clerk
        const clerkId = await createAdminInClerk();
        console.log(`Clerk ID: ${clerkId}`);

        // Step 2: Create in DynamoDB
        const adminUser = await createAdminInDynamoDB(clerkId);

        console.log('\n✅ Admin user created successfully!\n');
        console.log('📋 Admin Login Credentials:');
        console.log('━'.repeat(60));
        console.log(`Email: ${ADMIN_CONFIG.email}`);
        console.log(`Password: ${ADMIN_CONFIG.password}`);
        console.log(`User ID: ${adminUser.id}`);
        console.log(`Clerk ID: ${clerkId}`);
        console.log(`Role: ADMIN`);
        console.log('━'.repeat(60));
        console.log('\n🔑 You can now login at: http://localhost:3000/login');
        console.log('   Select "Admin" role and use the credentials above.\n');

    } catch (error) {
        console.error('\n❌ Failed to create admin user:', error);
        process.exit(1);
    }
}

main()
    .then(() => {
        console.log('✅ Script completed successfully\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
