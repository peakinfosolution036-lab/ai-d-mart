import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    AdminConfirmSignUpCommand,
    ResendConfirmationCodeCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    GetUserCommand,
    AdminGetUserCommand,
    AdminAddUserToGroupCommand,
    AdminUpdateUserAttributesCommand,
    AdminDisableUserCommand,
    AdminEnableUserCommand,
    ListUsersCommand,
    ListUsersInGroupCommand,
    AdminSetUserPasswordCommand,
    AdminRemoveUserFromGroupCommand,
    GlobalSignOutCommand,
    AdminDeleteUserCommand,
    ChangePasswordCommand,
    type AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';

import { createHmac } from 'crypto';

// Read env vars lazily at call time so Amplify runtime values are used (not stale module-load values)
function getConfig() {
    const USER_POOL_ID = (process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '').trim();
    const CLIENT_ID = (process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '').trim();
    const CLIENT_SECRET = (process.env.COGNITO_CLIENT_SECRET || '').trim();
    const rawRegion = (process.env.COGNITO_REGION || USER_POOL_ID?.split('_')[0] || 'ap-southeast-1').trim().replace(/['"]/g, '');
    const ACCESS_KEY = (process.env.APP_AWS_ACCESS_KEY_ID || '').trim();
    const SECRET_KEY = (process.env.APP_AWS_SECRET_ACCESS_KEY || '').trim();
    return { USER_POOL_ID, CLIENT_ID, CLIENT_SECRET, REGION: rawRegion, ACCESS_KEY, SECRET_KEY };
}

function computeSecretHash(username: string, clientId: string, clientSecret: string): string | undefined {
    if (!clientSecret) return undefined;
    const hmac = createHmac('sha256', clientSecret);
    hmac.update(username + clientId);
    return hmac.digest('base64');
}

function createCognitoClient() {
    const { REGION, ACCESS_KEY, SECRET_KEY } = getConfig();
    const clientConfig: ConstructorParameters<typeof CognitoIdentityProviderClient>[0] = { region: REGION };
    if (ACCESS_KEY && SECRET_KEY) {
        clientConfig.credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
    }
    return new CognitoIdentityProviderClient(clientConfig);
}

export interface CognitoAuthResult {
    success: boolean;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    error?: string;
    user?: any;
}

// Sign up a new user
export async function signUp(
    email: string,
    password: string,
    name: string,
    phone?: string,
    _role: string = 'CUSTOMER',
    username?: string
): Promise<CognitoAuthResult> {
    try {
        const { CLIENT_ID, CLIENT_SECRET } = getConfig();
        const client = createCognitoClient();

        const userAttributes = [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name },
        ];

        if (phone) {
            userAttributes.push({ Name: 'phone_number', Value: phone });
        }

        const cognitoUsername = username || email;

        const command = new SignUpCommand({
            ClientId: CLIENT_ID,
            Username: cognitoUsername,
            Password: password,
            UserAttributes: userAttributes,
            SecretHash: computeSecretHash(cognitoUsername, CLIENT_ID, CLIENT_SECRET),
        });

        const response = await client.send(command);

        return {
            success: true,
            user: {
                userSub: response.UserSub,
                username: cognitoUsername,
                email,
                name,
                confirmed: response.UserConfirmed
            }
        };
    } catch (error: any) {
        console.error('SignUp error:', error);
        return {
            success: false,
            error: error.message || 'Failed to sign up'
        };
    }
}

// Confirm sign up with verification code
export async function confirmSignUp(
    email: string,
    code: string
): Promise<CognitoAuthResult> {
    try {
        const { CLIENT_ID, CLIENT_SECRET } = getConfig();
        const client = createCognitoClient();

        const command = new ConfirmSignUpCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
            SecretHash: computeSecretHash(email, CLIENT_ID, CLIENT_SECRET),
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('Confirm signup error:', error);
        return {
            success: false,
            error: error.message || 'Failed to confirm sign up'
        };
    }
}

// Resend confirmation code
export async function resendConfirmationCode(email: string): Promise<CognitoAuthResult> {
    try {
        const { CLIENT_ID, CLIENT_SECRET } = getConfig();
        const client = createCognitoClient();

        const command = new ResendConfirmationCodeCommand({
            ClientId: CLIENT_ID,
            Username: email,
            SecretHash: computeSecretHash(email, CLIENT_ID, CLIENT_SECRET),
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('Resend confirmation code error:', error);
        return {
            success: false,
            error: error.message || 'Failed to resend confirmation code'
        };
    }
}

// Admin confirm user by email - finds username and confirms with admin API
export async function adminConfirmUserByEmail(email: string): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const listCommand = new ListUsersCommand({
            UserPoolId: USER_POOL_ID,
            Filter: `email = "${email}"`,
            Limit: 1,
        });

        const listResponse = await client.send(listCommand);

        if (!listResponse.Users || listResponse.Users.length === 0) {
            return { success: false, error: 'User not found' };
        }

        const username = listResponse.Users[0].Username;

        if (!username) {
            return { success: false, error: 'Username not found' };
        }

        const confirmCommand = new AdminConfirmSignUpCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
        });

        await client.send(confirmCommand);

        const updateCommand = new AdminUpdateUserAttributesCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            UserAttributes: [
                { Name: 'email_verified', Value: 'true' },
            ],
        });

        await client.send(updateCommand);

        return { success: true };
    } catch (error: any) {
        console.error('Admin confirm user error:', error);

        if (error.name === 'NotAuthorizedException' && error.message?.includes('confirmed')) {
            return { success: true };
        }

        return {
            success: false,
            error: error.message || 'Failed to confirm user'
        };
    }
}

// Sign in user
export async function signIn(
    email: string,
    password: string
): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID, CLIENT_ID, CLIENT_SECRET } = getConfig();
        const client = createCognitoClient();

        // Look up the actual Cognito username by email.
        // SECRET_HASH must be computed with the real username, not the email alias.
        let cognitoUsername = email;
        try {
            const listCmd = new ListUsersCommand({
                UserPoolId: USER_POOL_ID,
                Filter: `email = "${email}"`,
                Limit: 1,
            });
            const listRes = await client.send(listCmd);
            if (listRes.Users && listRes.Users.length > 0 && listRes.Users[0].Username) {
                cognitoUsername = listRes.Users[0].Username;
                console.log('[signIn] Resolved username from email:', cognitoUsername);
            }
        } catch (listErr: any) {
            console.warn('[signIn] ListUsers failed, falling back to email as username:', listErr.message);
        }

        const authParams: Record<string, string> = {
            USERNAME: cognitoUsername,
            PASSWORD: password,
        };

        const secretHash = computeSecretHash(cognitoUsername, CLIENT_ID, CLIENT_SECRET);
        if (secretHash) {
            authParams.SECRET_HASH = secretHash;
        }

        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH' as AuthFlowType,
            ClientId: CLIENT_ID,
            AuthParameters: authParams,
        });

        const response = await client.send(command);

        if (response.AuthenticationResult) {
            return {
                success: true,
                accessToken: response.AuthenticationResult.AccessToken,
                idToken: response.AuthenticationResult.IdToken,
                refreshToken: response.AuthenticationResult.RefreshToken,
            };
        }

        return {
            success: false,
            error: 'Authentication failed'
        };
    } catch (error: any) {
        console.error('SignIn error:', error);

        if (error.name === 'NotAuthorizedException') {
            return { success: false, error: 'Invalid email or password' };
        }
        if (error.name === 'UserNotConfirmedException') {
            return { success: false, error: 'Please verify your email first' };
        }
        if (error.name === 'UserNotFoundException') {
            return { success: false, error: 'User not found' };
        }

        return {
            success: false,
            error: error.message || 'Failed to sign in'
        };
    }
}

// Get current user from access token
export async function getCurrentUser(accessToken: string): Promise<CognitoAuthResult> {
    try {
        const client = createCognitoClient();

        const command = new GetUserCommand({
            AccessToken: accessToken,
        });

        const response = await client.send(command);

        const attributes: Record<string, string> = {};
        response.UserAttributes?.forEach((attr: any) => {
            if (attr.Name && attr.Value) {
                attributes[attr.Name] = attr.Value;
            }
        });

        return {
            success: true,
            user: {
                username: response.Username,
                email: attributes.email,
                name: attributes.name,
                phone: attributes.phone_number,
                emailVerified: attributes.email_verified === 'true',
                sub: attributes.sub,
            }
        };
    } catch (error: any) {
        console.error('GetUser error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get user'
        };
    }
}

// Forgot password - initiate
export async function forgotPassword(email: string): Promise<CognitoAuthResult> {
    try {
        const { CLIENT_ID, CLIENT_SECRET } = getConfig();
        const client = createCognitoClient();

        const command = new ForgotPasswordCommand({
            ClientId: CLIENT_ID,
            Username: email,
            SecretHash: computeSecretHash(email, CLIENT_ID, CLIENT_SECRET),
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('ForgotPassword error:', error);
        return {
            success: false,
            error: error.message || 'Failed to initiate password reset'
        };
    }
}

// Confirm forgot password with code
export async function confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
): Promise<CognitoAuthResult> {
    try {
        const { CLIENT_ID, CLIENT_SECRET } = getConfig();
        const client = createCognitoClient();

        const command = new ConfirmForgotPasswordCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
            SecretHash: computeSecretHash(email, CLIENT_ID, CLIENT_SECRET),
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('ConfirmForgotPassword error:', error);
        return {
            success: false,
            error: error.message || 'Failed to reset password'
        };
    }
}

// Sign out user globally
export async function signOut(accessToken: string): Promise<CognitoAuthResult> {
    try {
        const client = createCognitoClient();

        const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('SignOut error:', error);
        return {
            success: false,
            error: error.message || 'Failed to sign out'
        };
    }
}

// Refresh tokens
export async function refreshTokens(refreshToken: string): Promise<CognitoAuthResult> {
    try {
        const { CLIENT_ID } = getConfig();
        const client = createCognitoClient();

        const command = new InitiateAuthCommand({
            AuthFlow: 'REFRESH_TOKEN_AUTH' as AuthFlowType,
            ClientId: CLIENT_ID,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });

        const response = await client.send(command);

        if (response.AuthenticationResult) {
            return {
                success: true,
                accessToken: response.AuthenticationResult.AccessToken,
                idToken: response.AuthenticationResult.IdToken,
            };
        }

        return { success: false, error: 'Token refresh failed' };
    } catch (error: any) {
        console.error('RefreshTokens error:', error);
        return {
            success: false,
            error: error.message || 'Failed to refresh tokens'
        };
    }
}

// ADMIN FUNCTIONS

// Admin: Get user by email
export async function adminGetUser(email: string): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminGetUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
        });

        const response = await client.send(command);

        const attributes: Record<string, string> = {};
        response.UserAttributes?.forEach((attr: any) => {
            if (attr.Name && attr.Value) {
                attributes[attr.Name] = attr.Value;
            }
        });

        return {
            success: true,
            user: {
                username: response.Username,
                email: attributes.email,
                name: attributes.name,
                phone: attributes.phone_number,
                status: response.UserStatus,
                enabled: response.Enabled,
                createdAt: response.UserCreateDate,
            }
        };
    } catch (error: any) {
        console.error('AdminGetUser error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get user'
        };
    }
}

// Admin: Add user to group
export async function adminAddUserToGroup(
    email: string,
    groupName: string
): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminAddUserToGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            GroupName: groupName,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminAddUserToGroup error:', error);
        return {
            success: false,
            error: error.message || 'Failed to add user to group'
        };
    }
}

// Admin: Update user attributes
export async function adminUpdateUserAttributes(
    email: string,
    attributes: { Name: string; Value: string }[]
): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminUpdateUserAttributesCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            UserAttributes: attributes,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminUpdateUserAttributes error:', error);
        return {
            success: false,
            error: error.message || 'Failed to update user attributes'
        };
    }
}

// Admin: Disable user
export async function adminDisableUser(email: string): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminDisableUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminDisableUser error:', error);
        return {
            success: false,
            error: error.message || 'Failed to disable user'
        };
    }
}

// Admin: Enable user
export async function adminEnableUser(email: string): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminEnableUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminEnableUser error:', error);
        return {
            success: false,
            error: error.message || 'Failed to enable user'
        };
    }
}

// Admin: List all users
export async function adminListUsers(limit: number = 60): Promise<any[]> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new ListUsersCommand({
            UserPoolId: USER_POOL_ID,
            Limit: limit,
        });

        const response = await client.send(command);

        return (response.Users || []).map((user: any) => {
            const attributes: Record<string, string> = {};
            user.Attributes?.forEach((attr: any) => {
                if (attr.Name && attr.Value) {
                    attributes[attr.Name] = attr.Value;
                }
            });

            return {
                username: user.Username,
                email: attributes.email,
                name: attributes.name,
                phone: attributes.phone_number,
                status: user.UserStatus,
                enabled: user.Enabled,
                createdAt: user.UserCreateDate,
            };
        });
    } catch (error: any) {
        console.error('AdminListUsers error:', error);
        return [];
    }
}

// Admin: List users in group
export async function adminListUsersInGroup(groupName: string): Promise<any[]> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new ListUsersInGroupCommand({
            UserPoolId: USER_POOL_ID,
            GroupName: groupName,
        });

        const response = await client.send(command);

        return (response.Users || []).map((user: any) => {
            const attributes: Record<string, string> = {};
            user.Attributes?.forEach((attr: any) => {
                if (attr.Name && attr.Value) {
                    attributes[attr.Name] = attr.Value;
                }
            });

            return {
                username: user.Username,
                email: attributes.email,
                name: attributes.name,
                status: user.UserStatus,
                enabled: user.Enabled,
            };
        });
    } catch (error: any) {
        console.error('AdminListUsersInGroup error:', error);
        return [];
    }
}

// Admin: Set user password (Reset)
export async function adminSetUserPassword(
    email: string,
    password: string,
    permanent: boolean = true
): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: permanent,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminSetUserPassword error:', error);
        return {
            success: false,
            error: error.message || 'Failed to reset password'
        };
    }
}

// Admin: Remove user from group
export async function adminRemoveUserFromGroup(
    email: string,
    groupName: string
): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminRemoveUserFromGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            GroupName: groupName,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminRemoveUserFromGroup error:', error);
        return {
            success: false,
            error: error.message || 'Failed to remove user from group'
        };
    }
}

// Admin: Delete user
export async function adminDeleteUser(email: string): Promise<CognitoAuthResult> {
    try {
        const { USER_POOL_ID } = getConfig();
        const client = createCognitoClient();

        const command = new AdminDeleteUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('AdminDeleteUser error:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete user'
        };
    }
}

// Change password for a logged in user
export async function changePassword(
    accessToken: string,
    previousPassword: string,
    proposedPassword: string
): Promise<CognitoAuthResult> {
    try {
        const client = createCognitoClient();

        const command = new ChangePasswordCommand({
            AccessToken: accessToken,
            PreviousPassword: previousPassword,
            ProposedPassword: proposedPassword,
        });

        await client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('ChangePassword error:', error);
        return {
            success: false,
            error: error.name === 'NotAuthorizedException' ? 'Current password is incorrect' : (error.message || 'Failed to change password')
        };
    }
}
