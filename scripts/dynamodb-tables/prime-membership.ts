import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

config({ path: '.env.local' });

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

export async function createPrimeMembershipTables() {
    console.log('Creating Prime Membership tables...');

    // Prime Memberships Table
    const primeMembershipsTable = {
        TableName: 'ai-d-mart-prime-memberships',
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'GSI1',
                KeySchema: [
                    { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                    { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    // Wallets Table
    const walletsTable = {
        TableName: 'ai-d-mart-wallets',
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'GSI1',
                KeySchema: [
                    { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                    { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    // Referrals Table
    const referralsTable = {
        TableName: 'ai-d-mart-referrals',
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'GSI1',
                KeySchema: [
                    { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                    { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    // Lucky Draw Table
    const luckyDrawTable = {
        TableName: 'ai-d-mart-lucky-draw',
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'GSI1',
                KeySchema: [
                    { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                    { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    // Prime Rewards Table
    const primeRewardsTable = {
        TableName: 'ai-d-mart-prime-rewards',
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'GSI1',
                KeySchema: [
                    { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                    { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    const tables = [
        primeMembershipsTable,
        walletsTable,
        referralsTable,
        luckyDrawTable,
        primeRewardsTable
    ];

    try {
        for (const table of tables) {
            console.log(`Creating table: ${table.TableName}`);
            await client.send(new CreateTableCommand(table));
            console.log(`✅ Created table: ${table.TableName}`);
        }
        console.log('All Prime Membership tables created successfully!');
    } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
            console.log('Tables already exist, skipping creation');
        } else {
            console.error('Error creating tables:', error);
            throw error;
        }
    }
}

if (require.main === module) {
    createPrimeMembershipTables().catch(console.error);
}