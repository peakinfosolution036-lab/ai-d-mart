import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';

// Read env vars lazily at call time so Amplify runtime values are used
function getRegion() { return (process.env.APP_AWS_REGION || 'ap-southeast-1').trim(); }
function getUsersTable() { return (process.env.DYNAMODB_USERS_TABLE || 'ai-d-mart-users').trim(); }
function getDataTable() { return (process.env.DYNAMODB_DATA_TABLE || 'ai-d-mart-data').trim(); }


// Create DynamoDB client lazily with credentials read at call time
function createDdbClient() {
    const region = getRegion();
    const accessKeyId = (process.env.APP_AWS_ACCESS_KEY_ID || '').trim();
    const secretAccessKey = (process.env.APP_AWS_SECRET_ACCESS_KEY || '').trim();
    const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = { region };
    if (accessKeyId && secretAccessKey) {
        clientConfig.credentials = { accessKeyId, secretAccessKey };
    }
    return new DynamoDBClient(clientConfig);
}

function createDocClient() {
    return DynamoDBDocumentClient.from(createDdbClient(), {
        marshallOptions: {
            removeUndefinedValues: true,
            convertEmptyValues: true
        }
    });
}

// docClient proxy - creates a fresh client each call so env vars are read at request time
export const docClient = new Proxy({} as DynamoDBDocumentClient, {
    get(_target, prop) {
        const client = createDocClient();
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    }
});

// ==================== USER OPERATIONS ====================

export interface UserProfile {
    id: string;
    cognitoSub: string; // Cognito user sub ID
    email: string;
    name: string;
    phone?: string;
    mobile?: string;
    role: 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
    walletBalance: number;
    kycVerified: boolean;
    address?: string;
    pinCode?: string;
    dob?: string;
    aadhaarPan?: string;
    referredBy?: string;
    profileImage?: string;
    selfieImage?: string;
    location?: { lat: number; lng: number };
    referralCode?: string;
    primeCode?: string;
    isPrimeMember?: boolean;
    utrNumber?: string;
    paymentScreenshot?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    createdAt: string;
    updatedAt: string;
    // Legacy field for backwards compatibility with Clerk migration
    clerkId?: string;
}

// Create or update user profile
export async function putUserProfile(profile: UserProfile): Promise<boolean> {
    try {
        // Clean the profile object - remove undefined/null values
        const cleanedProfile: any = {};
        Object.keys(profile).forEach(key => {
            const value = (profile as any)[key];
            if (value !== undefined && value !== null) {
                cleanedProfile[key] = value;
            }
        });

        const item: any = {
            PK: `USER#${cleanedProfile.id}`,
            SK: `PROFILE`,
            GSI1PK: `ROLE#${cleanedProfile.role}`,
            GSI1SK: `STATUS#${cleanedProfile.status}#${cleanedProfile.id}`,
            ...cleanedProfile,
        };

        // Add GSI2 keys if cognitoSub is available (for efficient Cognito lookups)
        // Also support legacy clerkId field for backwards compatibility
        const authId = cleanedProfile.cognitoSub || cleanedProfile.clerkId;
        if (authId) {
            item.GSI2PK = `COGNITO#${authId}`;
            item.GSI2SK = 'PROFILE';
            // Store in both fields for backwards compatibility
            item.cognitoSub = authId;
            item.clerkId = authId;
        }

        const command = new PutCommand({
            TableName: getUsersTable(),
            Item: item,
        });

        await docClient.send(command);
        console.log('User profile saved successfully:', item.id);
        return true;
    } catch (error: any) {
        console.error('PutUserProfile error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.$metadata?.httpStatusCode);
        console.error('Table name:', getUsersTable());
        console.error('Region:', getRegion());
        console.error('Profile data that failed:', JSON.stringify(profile, null, 2));
        return false;
    }
}

// Get user by ID
export async function getUserById(userId: string): Promise<UserProfile | null> {
    try {
        const command = new GetCommand({
            TableName: getUsersTable(),
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
            },
        });

        const response = await docClient.send(command);
        return response.Item as UserProfile || null;
    } catch (error) {
        console.error('GetUserById error:', error);
        return null;
    }
}

// Get user by Cognito sub ID
export async function getUserByCognitoSub(cognitoSub: string): Promise<UserProfile | null> {
    try {
        // Try GSI2 first (if available) - most efficient lookup
        // Try both COGNITO# and legacy CLERK# prefixes
        try {
            // Try new COGNITO# prefix first
            let gsi2Command = new QueryCommand({
                TableName: getUsersTable(),
                IndexName: 'GSI2',
                KeyConditionExpression: 'GSI2PK = :pk AND GSI2SK = :sk',
                ExpressionAttributeValues: {
                    ':pk': `COGNITO#${cognitoSub}`,
                    ':sk': 'PROFILE',
                },
            });
            let gsi2Response = await docClient.send(gsi2Command);
            if (gsi2Response.Items && gsi2Response.Items.length > 0) {
                return gsi2Response.Items[0] as UserProfile;
            }

            // Try legacy CLERK# prefix
            gsi2Command = new QueryCommand({
                TableName: getUsersTable(),
                IndexName: 'GSI2',
                KeyConditionExpression: 'GSI2PK = :pk AND GSI2SK = :sk',
                ExpressionAttributeValues: {
                    ':pk': `CLERK#${cognitoSub}`,
                    ':sk': 'PROFILE',
                },
            });
            gsi2Response = await docClient.send(gsi2Command);
            if (gsi2Response.Items && gsi2Response.Items.length > 0) {
                return gsi2Response.Items[0] as UserProfile;
            }
        } catch (gsi2Error) {
            // GSI2 might not exist, fall through to GSI1
            console.log('GSI2 not available, falling back to GSI1');
        }

        // Fallback to GSI1 with filter - check both roles
        // Support both cognitoSub and legacy clerkId fields
        const command = new QueryCommand({
            TableName: getUsersTable(),
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            FilterExpression: 'cognitoSub = :id OR clerkId = :id',
            ExpressionAttributeValues: {
                ':pk': 'ROLE#CUSTOMER',
                ':id': cognitoSub,
            },
        });

        const response = await docClient.send(command);
        const users = response.Items || [];

        if (users.length === 0) {
            // Try admin role
            const adminCommand = new QueryCommand({
                TableName: getUsersTable(),
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :pk',
                FilterExpression: 'cognitoSub = :id OR clerkId = :id',
                ExpressionAttributeValues: {
                    ':pk': 'ROLE#ADMIN',
                    ':id': cognitoSub,
                },
            });
            const adminResponse = await docClient.send(adminCommand);
            return (adminResponse.Items?.[0] as UserProfile) || null;
        }

        return users[0] as UserProfile;
    } catch (error) {
        console.error('GetUserByCognitoSub error:', error);
        return null;
    }
}

// Legacy function name for backwards compatibility with Clerk
export async function getUserByClerkId(clerkId: string): Promise<UserProfile | null> {
    return getUserByCognitoSub(clerkId);
}

// Get users by role
export async function getUsersByRole(
    role: 'ADMIN' | 'CUSTOMER',
    status?: string
): Promise<UserProfile[]> {
    try {
        let keyCondition = 'GSI1PK = :pk';
        const expressionValues: Record<string, any> = {
            ':pk': `ROLE#${role}`,
        };

        if (status) {
            keyCondition += ' AND begins_with(GSI1SK, :status)';
            expressionValues[':status'] = `STATUS#${status}`;
        }

        const command = new QueryCommand({
            TableName: getUsersTable(),
            IndexName: 'GSI1',
            KeyConditionExpression: keyCondition,
            ExpressionAttributeValues: expressionValues,
        });

        const response = await docClient.send(command);
        return (response.Items || []) as UserProfile[];
    } catch (error) {
        console.error('GetUsersByRole error:', error);
        return [];
    }
}

// Users helper for older code patterns
export const users = {
    get: (id: string) => getUserById(id),
    update: async (userId: string, data: any) => {
        try {
            const current = await getUserById(userId);
            if (!current) return false;
            return putUserProfile({ ...current, ...data, updatedAt: new Date().toISOString() });
        } catch (e) { return false; }
    }
};

// Update user status
export async function updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
): Promise<boolean> {
    try {
        // First get the user to get their role
        const user = await getUserById(userId);
        if (!user) return false;

        const command = new UpdateCommand({
            TableName: getUsersTable(),
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
            },
            UpdateExpression: 'SET #status = :status, GSI1SK = :gsi1sk, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':gsi1sk': `STATUS#${status}#${userId}`,
                ':updatedAt': new Date().toISOString(),
            },
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('UpdateUserStatus error:', error);
        return false;
    }
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
    try {
        const command = new DeleteCommand({
            TableName: getUsersTable(),
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
            },
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('DeleteUser error:', error);
        return false;
    }
}

// Update user role
export async function updateUserRole(
    userId: string,
    role: 'ADMIN' | 'CUSTOMER',
    permissions: string[] = []
): Promise<boolean> {
    try {
        const command = new UpdateCommand({
            TableName: getUsersTable(),
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
            },
            UpdateExpression: 'SET #role = :role, GSI1PK = :gsi1pk, permissions = :perms, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#role': 'role',
            },
            ExpressionAttributeValues: {
                ':role': role,
                ':gsi1pk': `ROLE#${role}`,
                ':perms': permissions,
                ':updatedAt': new Date().toISOString(),
            },
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('UpdateUserRole error:', error);
        return false;
    }
}

// Update user wallet balance
export async function updateWalletBalance(
    userId: string,
    amount: number,
    operation: 'add' | 'subtract'
): Promise<boolean> {
    try {
        const updateExpr = operation === 'add'
            ? 'SET walletBalance = walletBalance + :amount, updatedAt = :updatedAt'
            : 'SET walletBalance = walletBalance - :amount, updatedAt = :updatedAt';

        const command = new UpdateCommand({
            TableName: getUsersTable(),
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
            },
            UpdateExpression: updateExpr,
            ExpressionAttributeValues: {
                ':amount': amount,
                ':updatedAt': new Date().toISOString(),
            },
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('UpdateWalletBalance error:', error);
        return false;
    }
}

// ==================== DATA OPERATIONS ====================

// Generic put item
export async function putDataItem(
    type: string,
    id: string,
    data: Record<string, any>
): Promise<boolean> {
    try {
        const command = new PutCommand({
            TableName: getDataTable(),
            Item: {
                PK: `${type.toUpperCase()}#${id}`,
                SK: 'DATA',
                entityType: type,
                id,
                ...data,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('PutDataItem error:', error);
        return false;
    }
}

// Get item by type and ID
export async function getDataItem(type: string, id: string): Promise<any | null> {
    try {
        const command = new GetCommand({
            TableName: getDataTable(),
            Key: {
                PK: `${type.toUpperCase()}#${id}`,
                SK: 'DATA',
            },
        });

        const response = await docClient.send(command);
        return response.Item || null;
    } catch (error) {
        console.error('GetDataItem error:', error);
        return null;
    }
}

// Get all items of a type
export async function getDataItemsByType(type: string): Promise<any[]> {
    try {
        const command = new ScanCommand({
            TableName: getDataTable(),
            FilterExpression: 'entityType = :type OR begins_with(PK, :prefix)',
            ExpressionAttributeValues: {
                ':type': type,
                ':prefix': `${type.toUpperCase()}#`
            },
        });

        const response = await docClient.send(command);
        return (response.Items || []).sort((a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    } catch (error) {
        console.error(`GetDataItemsByType error (${type}):`, error);
        return [];
    }
}

// Delete item
export async function deleteDataItem(type: string, id: string): Promise<boolean> {
    try {
        const command = new DeleteCommand({
            TableName: getDataTable(),
            Key: {
                PK: `${type.toUpperCase()}#${id}`,
                SK: 'DATA',
            },
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('DeleteDataItem error:', error);
        return false;
    }
}

// Update item
export async function updateDataItem(
    type: string,
    id: string,
    updates: Record<string, any>
): Promise<boolean> {
    try {
        const keys = Object.keys(updates);
        if (keys.length === 0) return true;

        const updateExpr = 'SET ' + keys.map((k, i) => `#key${i} = :val${i}`).join(', ') + ', updatedAt = :now';
        const attrNames = Object.fromEntries(keys.map((k, i) => [`#key${i}`, k]));
        const attrValues = Object.fromEntries(keys.map((k, i) => [`:val${i}`, updates[k]]));
        attrValues[':now'] = new Date().toISOString();

        const command = new UpdateCommand({
            TableName: getDataTable(),
            Key: {
                PK: `${type.toUpperCase()}#${id}`,
                SK: 'DATA',
            },
            UpdateExpression: updateExpr,
            ExpressionAttributeNames: attrNames,
            ExpressionAttributeValues: attrValues,
        });

        await docClient.send(command);
        return true;
    } catch (error) {
        console.error('UpdateDataItem error:', error);
        return false;
    }
}

// ==================== SPECIFIC DATA OPERATIONS ====================

// Events
export const events = {
    create: (id: string, data: any) => putDataItem('event', id, { ...data, views: 0, bookings: 0, revenue: 0 }),
    get: (id: string) => getDataItem('event', id),
    getAll: () => getDataItemsByType('event'),
    update: async (id: string, updates: Record<string, any>) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `EVENT#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET ' + Object.keys(updates).map((k, i) => `#key${i} = :val${i}`).join(', ') + ', updatedAt = :now',
                ExpressionAttributeNames: Object.fromEntries(Object.keys(updates).map((k, i) => [`#key${i}`, k])),
                ExpressionAttributeValues: {
                    ...Object.fromEntries(Object.entries(updates).map(([k, v], i) => [`:val${i}`, v])),
                    ':now': new Date().toISOString()
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('UpdateEvent error:', error);
            return false;
        }
    },
    trackView: async (id: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `EVENT#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET views = if_not_exists(views, :zero) + :inc',
                ExpressionAttributeValues: { ':inc': 1, ':zero': 0 }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    },
    delete: (id: string) => deleteDataItem('event', id),
};

// Event Categories
export const eventCategories = {
    getAll: async () => {
        const settings = await getDataItem('settings', 'event_categories');
        return settings?.categories || ['Wedding', 'Corporate', 'Expo', 'Concert'];
    },
    add: async (category: string) => {
        const current = await eventCategories.getAll();
        if (current.includes(category)) return true;
        return putDataItem('settings', 'event_categories', { categories: [...current, category] });
    }
};

// Event Bookings
export const eventBookings = {
    create: async (id: string, data: any) => {
        const success = await putDataItem('event_booking', id, data);
        if (success) {
            // Update event booking count and revenue
            const event = await events.get(data.eventId);
            if (event) {
                await events.update(data.eventId, {
                    bookings: (event.bookings || 0) + 1,
                    revenue: (event.revenue || 0) + (data.amount || 0)
                });
            }
        }
        return success;
    },
    get: (id: string) => getDataItem('event_booking', id),
    getByUser: async (userId: string) => {
        try {
            const command = new ScanCommand({
                TableName: getDataTable(),
                FilterExpression: 'entityType = :type AND userId = :userId',
                ExpressionAttributeValues: { ':type': 'event_booking', ':userId': userId },
            });
            const response = await docClient.send(command);
            return response.Items || [];
        } catch (error) { return []; }
    },
    getAll: () => getDataItemsByType('event_booking'),
    update: (id: string, updates: Record<string, any>) => updateDataItem('event_booking', id, updates),
};

// Products
export const products = {
    create: (id: string, data: any) => putDataItem('product', id, data),
    get: (id: string) => getDataItem('product', id),
    getAll: () => getDataItemsByType('product'),
    getByStore: async (storeId: string) => {
        const all = await getDataItemsByType('product');
        return all.filter(p => p.storeId === storeId || p.businessId === storeId);
    },
    update: (id: string, updates: Record<string, any>) => updateDataItem('product', id, updates),
    delete: (id: string) => deleteDataItem('product', id),
};

// Stores (Specialized version of Businesses)
export const stores = {
    create: (id: string, data: any) => putDataItem('store', id, { ...data, status: 'pending', createdAt: new Date().toISOString() }),
    get: (id: string) => getDataItem('store', id),
    getAll: () => getDataItemsByType('store'),
    updateStatus: async (id: string, status: 'active' | 'suspended' | 'rejected') => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `STORE#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET #status = :status, updatedAt = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    },
    getByUser: async (userId: string) => {
        const all = await getDataItemsByType('store');
        return all.filter(s => s.userId === userId);
    },
    delete: (id: string) => deleteDataItem('store', id),
};

// Orders & Bookings
export const orders = {
    create: (id: string, data: any) => putDataItem('order', id, { ...data, status: 'pending', createdAt: new Date().toISOString() }),
    get: (id: string) => getDataItem('order', id),
    getAll: () => getDataItemsByType('order'),
    getByUser: async (userId: string) => {
        const all = await getDataItemsByType('order');
        return all.filter(o => o.userId === userId);
    },
    updateStatus: async (id: string, status: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `ORDER#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET #status = :status, updatedAt = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    }
};

// Reviews
export const reviews = {
    create: (id: string, data: any) => putDataItem('review', id, { ...data, createdAt: new Date().toISOString() }),
    getByTarget: async (targetId: string) => {
        const all = await getDataItemsByType('review');
        return all.filter(r => r.targetId === targetId);
    }
};

// Jobs
export const jobs = {
    create: async (id: string, data: any) => putDataItem('job', id, { ...data, status: data.status || 'published', applicationsCount: 0, createdAt: new Date().toISOString() }),
    get: (id: string) => getDataItem('job', id),
    getAll: () => getDataItemsByType('job'),
    getByUser: async (userId: string) => {
        const all = await getDataItemsByType('job');
        return all.filter(j => j.postedBy === userId);
    },
    updateStatus: async (id: string, status: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `JOB#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET #status = :status, updatedAt = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    },
    incrementApplications: async (id: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `JOB#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET applicationsCount = if_not_exists(applicationsCount, :zero) + :inc',
                ExpressionAttributeValues: { ':inc': 1, ':zero': 0 }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    },
    update: (id: string, updates: Record<string, any>) => updateDataItem('job', id, updates),
    delete: (id: string) => deleteDataItem('job', id),
};

// Job Applications
export const jobApplications = {
    create: async (id: string, data: any) => {
        const success = await putDataItem('job_application', id, data);
        if (success) {
            await jobs.incrementApplications(data.jobId);
        }
        return success;
    },
    get: (id: string) => getDataItem('job_application', id),
    getAll: () => getDataItemsByType('job_application'),
    getByJob: async (jobId: string) => {
        const all = await getDataItemsByType('job_application');
        return all.filter(a => a.jobId === jobId);
    },
    getByUser: async (userId: string) => {
        const all = await getDataItemsByType('job_application');
        return all.filter(a => a.applicantId === userId);
    },
    updateStatus: async (id: string, status: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `JOB_APPLICATION#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET #status = :status, updatedAt = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    }
};

// Offers
export const offers = {
    create: (id: string, data: any) => putDataItem('offer', id, data),
    get: (id: string) => getDataItem('offer', id),
    getAll: () => getDataItemsByType('offer'),
    getByStore: async (storeId: string) => {
        const all = await getDataItemsByType('offer');
        return all.filter(p => p.storeId === storeId);
    },
    update: async (id: string, updates: Record<string, any>) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `OFFER#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET ' + Object.keys(updates).map((k, i) => `#key${i} = :val${i}`).join(', ') + ', updatedAt = :now',
                ExpressionAttributeNames: Object.fromEntries(Object.keys(updates).map((k, i) => [`#key${i}`, k])),
                ExpressionAttributeValues: {
                    ...Object.fromEntries(Object.entries(updates).map(([k, v], i) => [`:val${i}`, v])),
                    ':now': new Date().toISOString()
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('UpdateOffer error:', error);
            return false;
        }
    },
    delete: (id: string) => deleteDataItem('offer', id),
};

// Rewards
export const rewards = {
    create: (id: string, data: any) => putDataItem('reward', id, data),
    get: (id: string) => getDataItem('reward', id),
    getAll: () => getDataItemsByType('reward'),
    delete: (id: string) => deleteDataItem('reward', id),
};

// Transactions
export const transactions = {
    create: (id: string, data: any) => putDataItem('transaction', id, data),
    get: (id: string) => getDataItem('transaction', id),
    getByUser: async (userId: string) => {
        try {
            const command = new ScanCommand({
                TableName: getDataTable(),
                FilterExpression: 'entityType = :type AND userId = :userId',
                ExpressionAttributeValues: { ':type': 'transaction', ':userId': userId },
            });
            const response = await docClient.send(command);
            return response.Items || [];
        } catch (error) {
            console.error('GetTransactionsByUser error:', error);
            return [];
        }
    },
    getAll: () => getDataItemsByType('transaction'),
};

// Cart
export const cart = {
    getByUserId: (userId: string) => getDataItem('cart', userId),
    update: (userId: string, items: any[]) => putDataItem('cart', userId, { userId, items, updatedAt: new Date().toISOString() }),
    clear: (userId: string) => deleteDataItem('cart', userId),
};

// Notifications
export const notifications = {
    create: (id: string, data: any) => putDataItem('notification', id, data),
    get: (id: string) => getDataItem('notification', id),
    getAll: () => getDataItemsByType('notification'),
    getByUser: async (userId: string, userProfile?: any) => {
        try {
            // Get private notifications
            const privateCommand = new ScanCommand({
                TableName: getDataTable(),
                FilterExpression: '(entityType = :type OR begins_with(PK, :prefix)) AND userId = :userId',
                ExpressionAttributeValues: {
                    ':type': 'notification',
                    ':prefix': 'NOTIFICATION#',
                    ':userId': userId
                },
            });
            const privateResponse = await docClient.send(privateCommand);
            const privateNotifs = privateResponse.Items || [];

            // Get broadcasts
            const broadcastCommand = new ScanCommand({
                TableName: getDataTable(),
                FilterExpression: '(entityType = :type OR begins_with(PK, :prefix)) AND (attribute_not_exists(userId) OR userId = :all)',
                ExpressionAttributeValues: {
                    ':type': 'notification',
                    ':prefix': 'NOTIFICATION#',
                    ':all': 'ALL'
                },
            });
            const broadcastResponse = await docClient.send(broadcastCommand);
            let broadcasts = broadcastResponse.Items || [];

            // Filter broadcasts by targetCity, targetInterests, targetEventType if they exist
            if (userProfile) {
                broadcasts = broadcasts.filter(n => {
                    const matchesCity = !n.targetCity || n.targetCity.toLowerCase() === userProfile.city?.toLowerCase();
                    const matchesEventType = !n.targetEventType || n.targetEventType.toLowerCase() === userProfile.interest?.toLowerCase();

                    let matchesInterests = true;
                    if (n.targetInterests && n.targetInterests.length > 0 && userProfile.interests) {
                        matchesInterests = n.targetInterests.some((i: string) => userProfile.interests.includes(i));
                    }

                    return matchesCity && matchesEventType && matchesInterests;
                });
            }

            return [...privateNotifs, ...broadcasts].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error) {
            console.error('GetNotificationsByUser error:', error);
            return [];
        }
    },
    update: async (id: string, updates: Record<string, any>) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `NOTIFICATION#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET ' + Object.keys(updates).map((k, i) => `#key${i} = :val${i}`).join(', ') + ', updatedAt = :now',
                ExpressionAttributeNames: Object.fromEntries(Object.keys(updates).map((k, i) => [`#key${i}`, k])),
                ExpressionAttributeValues: {
                    ...Object.fromEntries(Object.entries(updates).map(([k, v], i) => [`:val${i}`, v])),
                    ':now': new Date().toISOString()
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('UpdateNotification error:', error);
            return false;
        }
    },
    delete: (id: string) => deleteDataItem('notification', id),
};

// Promotions
export const promotions = {
    create: (id: string, data: any) => putDataItem('promotion', id, data),
    get: (id: string) => getDataItem('promotion', id),
    getAll: () => getDataItemsByType('promotion'),
    delete: (id: string) => deleteDataItem('promotion', id),
};

// Businesses
export const businesses = {
    create: (id: string, data: any) => putDataItem('business', id, {
        ...data,
        status: data.status || 'pending',
        isVerified: data.isVerified || false,
        createdAt: data.createdAt || new Date().toISOString()
    }),
    get: (id: string) => getDataItem('business', id),
    getAll: () => getDataItemsByType('business'),
    getByUser: async (userId: string) => {
        const all = await getDataItemsByType('business');
        return all.filter(b => b.userId === userId);
    },
    update: async (id: string, updates: Record<string, any>) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `BUSINESS#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET ' + Object.keys(updates).map((k, i) => `#key${i} = :val${i}`).join(', ') + ', updatedAt = :now',
                ExpressionAttributeNames: Object.fromEntries(Object.keys(updates).map((k, i) => [`#key${i}`, k])),
                ExpressionAttributeValues: {
                    ...Object.fromEntries(Object.entries(updates).map(([k, v], i) => [`:val${i}`, v])),
                    ':now': new Date().toISOString()
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('UpdateBusiness error:', error);
            return false;
        }
    },
    verify: async (id: string) => {
        return businesses.update(id, {
            status: 'verified',
            isVerified: true,
            verificationDate: new Date().toISOString()
        });
    },
    delete: (id: string) => deleteDataItem('business', id),
};

// Bookings
export const bookings = {
    create: (id: string, data: any) => putDataItem('booking', id, { ...data, status: 'pending', createdAt: new Date().toISOString() }),
    get: (id: string) => getDataItem('booking', id),
    getAll: () => getDataItemsByType('booking'),
    getByBusiness: async (businessId: string) => {
        const all = await getDataItemsByType('booking');
        return all.filter(b => b.businessId === businessId);
    },
    getByUser: async (userId: string) => {
        const all = await getDataItemsByType('booking');
        return all.filter(b => b.customerId === userId);
    },
    updateStatus: async (id: string, status: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `BOOKING#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET #status = :status, updatedAt = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    }
};

// Leads
export const leads = {
    create: (id: string, data: any) => putDataItem('lead', id, { ...data, status: 'new', createdAt: new Date().toISOString() }),
    get: (id: string) => getDataItem('lead', id),
    getAll: () => getDataItemsByType('lead'),
    getByBusiness: async (businessId: string) => {
        const all = await getDataItemsByType('lead');
        return all.filter(l => l.businessId === businessId);
    },
    updateStatus: async (id: string, status: string) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `LEAD#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET #status = :status, updatedAt = :now',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }
            });
            await docClient.send(command);
            return true;
        } catch (error) { return false; }
    }
};

// ==================== SEARCH OPERATIONS ====================

export async function searchEvents(filters: {
    location?: string;
    date?: string;
    category?: string;
    query?: string;
}): Promise<any[]> {
    try {
        const allEvents = await getDataItemsByType('event');
        return allEvents.filter(event => {
            const matchesLocation = !filters.location || event.location?.toLowerCase().includes(filters.location.toLowerCase());
            const matchesDate = !filters.date || event.date === filters.date;
            const matchesCategory = !filters.category || event.category?.toLowerCase() === filters.category.toLowerCase();
            const matchesQuery = !filters.query ||
                event.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
                event.description?.toLowerCase().includes(filters.query.toLowerCase());

            return matchesLocation && matchesDate && matchesCategory && matchesQuery;
        });
    } catch (error) {
        console.error('SearchEvents error:', error);
        return [];
    }
}

export async function globalSearch(query: string, types: string[]): Promise<Record<string, any[]>> {
    try {
        const results: Record<string, any[]> = {};
        const q = query.toLowerCase();

        for (const type of types) {
            if (type === 'user') {
                const admins = await getUsersByRole('ADMIN');
                const customers = await getUsersByRole('CUSTOMER');
                const allUsers = [...admins, ...customers];
                results['user'] = allUsers.filter(u =>
                    u.name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    u.id?.toLowerCase().includes(q)
                );
                continue;
            }

            const items = await getDataItemsByType(type);
            results[type] = items.filter(item => {
                // Search across common fields
                const searchString = JSON.stringify(item).toLowerCase();
                return searchString.includes(q);
            });
        }

        return results;
    } catch (error) {
        console.error('GlobalSearch error:', error);
        return {};
    }
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

// Generate user ID
export function generateUserId(role: 'ADMIN' | 'CUSTOMER'): string {
    const prefix = role === 'ADMIN' ? 'ADM' : 'DI';
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
}

// Generate Sequential User ID (e.g. DE0001, DE0002)
export async function generateSequentialUserId(role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER'): Promise<string> {
    const prefix = role === 'ADMIN' ? 'ADM' : 'DE';
    const counterKey = `COUNTER#USER#${prefix}`;
    
    try {
        const command = new UpdateCommand({
            TableName: getDataTable(),
            Key: {
                PK: counterKey,
                SK: 'METADATA'
            },
            UpdateExpression: 'ADD currentCount :inc',
            ExpressionAttributeValues: {
                ':inc': 1
            },
            ReturnValues: 'UPDATED_NEW'
        });
        
        const response = await docClient.send(command);
        const nextId = response.Attributes?.currentCount || 1;
        
        // Pad with leading zeros to 4 digits (e.g. 1 -> 0001)
        const paddedId = nextId.toString().padStart(4, '0');
        return `${prefix}${paddedId}`;
    } catch (error) {
        console.error('Failed to generate sequential user ID, falling back to random:', error);
        return generateUserId(role);
    }
}

// ==================== AD CAMPAIGNS ====================
export const campaigns = {
    create: (id: string, data: any) => putDataItem('campaign', id, { ...data, status: 'pending', impressions: 0, clicks: 0, spent: 0, createdAt: new Date().toISOString() }),
    get: (id: string) => getDataItem('campaign', id),
    getAll: () => getDataItemsByType('campaign'),
    getByBusiness: async (businessId: string) => {
        const all = await getDataItemsByType('campaign');
        return all.filter(c => c.businessId === businessId);
    },
    getActive: async () => {
        const all = await getDataItemsByType('campaign');
        return all.filter(c => c.status === 'active');
    },
    update: async (id: string, updates: Record<string, any>) => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `CAMPAIGN#${id}`, SK: 'DATA' },
                UpdateExpression: 'SET ' + Object.keys(updates).map((k, i) => `#key${i} = :val${i}`).join(', ') + ', updatedAt = :now',
                ExpressionAttributeNames: Object.fromEntries(Object.keys(updates).map((k, i) => [`#key${i}`, k])),
                ExpressionAttributeValues: {
                    ...Object.fromEntries(Object.entries(updates).map(([, v], i) => [`:val${i}`, v])),
                    ':now': new Date().toISOString()
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('UpdateCampaign error:', error);
            return false;
        }
    },
    incrementStats: async (id: string, field: 'impressions' | 'clicks') => {
        try {
            const command = new UpdateCommand({
                TableName: getDataTable(),
                Key: { PK: `CAMPAIGN#${id}`, SK: 'DATA' },
                UpdateExpression: `SET ${field} = if_not_exists(${field}, :zero) + :one`,
                ExpressionAttributeValues: { ':zero': 0, ':one': 1 }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('IncrementCampaignStats error:', error);
            return false;
        }
    },
    delete: (id: string) => deleteDataItem('campaign', id),
};

// ==================== USER SETTINGS ====================
export const userSettings = {
    get: async (userId: string) => {
        try {
            const command = new GetCommand({
                TableName: getDataTable(),
                Key: { PK: `SETTINGS#${userId}`, SK: 'USER' }
            });
            const result = await docClient.send(command);
            return result.Item || null;
        } catch (error) {
            console.error('GetUserSettings error:', error);
            return null;
        }
    },
    save: async (userId: string, settings: any) => {
        try {
            const command = new PutCommand({
                TableName: getDataTable(),
                Item: {
                    PK: `SETTINGS#${userId}`,
                    SK: 'USER',
                    type: 'user_settings',
                    userId,
                    ...settings,
                    updatedAt: new Date().toISOString()
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('SaveUserSettings error:', error);
            return false;
        }
    },
    getDefault: () => ({
        notifications: { email: true, push: true, sms: false, promotions: true, orderUpdates: true, newOffers: true },
        language: 'en',
        region: 'IN',
        currency: 'INR',
        privacy: { profileVisibility: 'public', showLocation: true, allowAnalytics: true },
        paymentMethods: [],
        theme: 'system'
    })
};

// ==================== PLATFORM SETTINGS (Admin) ====================
export const platformSettings = {
    get: async () => {
        try {
            const command = new GetCommand({
                TableName: getDataTable(),
                Key: { PK: 'PLATFORM', SK: 'SETTINGS' }
            });
            const result = await docClient.send(command);
            return result.Item || platformSettings.getDefault();
        } catch (error) {
            console.error('GetPlatformSettings error:', error);
            return platformSettings.getDefault();
        }
    },
    save: async (settings: any, adminId: string) => {
        try {
            const command = new PutCommand({
                TableName: getDataTable(),
                Item: {
                    PK: 'PLATFORM',
                    SK: 'SETTINGS',
                    type: 'platform_settings',
                    ...settings,
                    updatedAt: new Date().toISOString(),
                    updatedBy: adminId
                }
            });
            await docClient.send(command);
            return true;
        } catch (error) {
            console.error('SavePlatformSettings error:', error);
            return false;
        }
    },
    getDefault: () => ({
        appName: 'AI D Mart',
        appVersion: '1.0.0',
        maintenanceMode: false,
        paymentGateway: { razorpay: true, paytm: false, upi: true },
        commissionRate: 10,
        taxRate: 18,
        minWithdrawal: 100,
        maxWithdrawal: 50000,
        featuredListingPrice: 499,
        adPricePerDay: 99,
        supportEmail: 'support@aidmart.in',
        supportPhone: '+91 1800 123 4567',
        socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
        features: { jobs: true, events: true, shopping: true, wallet: true }
    })
};

// ==================== REPORTS / ANALYTICS ====================
export const reports = {
    getPlatformStats: async () => {
        try {
            const [customers, admins, orders, events, businesses, bookings] = await Promise.all([
                getUsersByRole('CUSTOMER'),
                getUsersByRole('ADMIN'),
                getDataItemsByType('order'),
                getDataItemsByType('event'),
                getDataItemsByType('business'),
                getDataItemsByType('booking')
            ]);

            const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
            const activeBusinesses = businesses.filter((b: any) => b.status === 'active' || b.isVerified);

            // Top businesses by bookings
            const businessBookings: Record<string, { name: string; count: number; revenue: number }> = {};
            bookings.forEach((b: any) => {
                if (!businessBookings[b.businessId]) {
                    businessBookings[b.businessId] = { name: b.businessName || 'Unknown', count: 0, revenue: 0 };
                }
                businessBookings[b.businessId].count++;
                businessBookings[b.businessId].revenue += parseFloat(b.totalAmount) || 0;
            });

            const topBusinesses = Object.entries(businessBookings)
                .map(([id, data]) => ({ id, ...data }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            return {
                totalUsers: customers.length + admins.length,
                totalCustomers: customers.length,
                totalAdmins: admins.length,
                activeUsers: customers.filter((c: any) => c.status === 'ACTIVE').length,
                totalOrders: orders.length,
                totalRevenue,
                totalEvents: events.length,
                totalBusinesses: businesses.length,
                activeBusinesses: activeBusinesses.length,
                totalBookings: bookings.length,
                topBusinesses,
                pendingVerifications: businesses.filter((b: any) => b.status === 'pending').length
            };
        } catch (error) {
            console.error('GetPlatformStats error:', error);
            return null;
        }
    },
    getBusinessStats: async (businessId: string) => {
        try {
            const [bookings, leads, campaigns] = await Promise.all([
                getDataItemsByType('booking'),
                getDataItemsByType('lead'),
                getDataItemsByType('campaign')
            ]);

            const myBookings = bookings.filter((b: any) => b.businessId === businessId);
            const myLeads = leads.filter((l: any) => l.businessId === businessId);
            const myCampaigns = campaigns.filter((c: any) => c.businessId === businessId);

            const totalRevenue = myBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0);
            const totalImpressions = myCampaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0);
            const totalClicks = myCampaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);

            // Booking trends (last 7 days)
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const bookingTrends = last7Days.map(date => ({
                date,
                count: myBookings.filter((b: any) => b.createdAt?.startsWith(date)).length
            }));

            return {
                totalBookings: myBookings.length,
                pendingBookings: myBookings.filter((b: any) => b.status === 'pending').length,
                completedBookings: myBookings.filter((b: any) => b.status === 'completed').length,
                totalRevenue,
                totalLeads: myLeads.length,
                newLeads: myLeads.filter((l: any) => l.status === 'new').length,
                activeCampaigns: myCampaigns.filter((c: any) => c.status === 'active').length,
                totalImpressions,
                totalClicks,
                ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
                bookingTrends
            };
        } catch (error) {
            console.error('GetBusinessStats error:', error);
            return null;
        }
    }
};

// ==================== SOCIAL ENGAGEMENT ====================
export const socialEngagement = {
    trackShare: async (userId: string, contentType: string, contentId: string, platform: string) => {
        const id = generateId('share');
        return putDataItem('social_share', id, {
            userId,
            contentType,
            contentId,
            platform,
            createdAt: new Date().toISOString()
        });
    },
    getSharesByContent: async (contentType: string, contentId: string) => {
        const all = await getDataItemsByType('social_share');
        return all.filter(s => s.contentType === contentType && s.contentId === contentId);
    },
    followBusiness: async (userId: string, businessId: string) => {
        const id = `${userId}_${businessId}`;
        return putDataItem('follow', id, {
            userId,
            businessId,
            createdAt: new Date().toISOString()
        });
    },
    unfollowBusiness: async (userId: string, businessId: string) => {
        const id = `${userId}_${businessId}`;
        return deleteDataItem('follow', id);
    },
    getFollowers: async (businessId: string) => {
        const all = await getDataItemsByType('follow');
        return all.filter(f => f.businessId === businessId);
    },
    getFollowing: async (userId: string) => {
        const all = await getDataItemsByType('follow');
        return all.filter(f => f.userId === userId);
    }
};
