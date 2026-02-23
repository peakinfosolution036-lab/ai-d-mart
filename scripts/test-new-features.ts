/**
 * Tests for Reports, Promotions/Campaigns, Social, and Settings APIs
 * 
 * Run with: npx ts-node --esm scripts/test-new-features.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

async function testAPI(name: string, fn: () => Promise<boolean>) {
    try {
        const passed = await fn();
        results.push({ name, passed });
        console.log(`${passed ? '✅' : '❌'} ${name}`);
    } catch (error: any) {
        results.push({ name, passed: false, error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

// Test Reports API
async function testReportsAPI() {
    // Platform stats
    await testAPI('GET /api/reports - Platform Stats', async () => {
        const res = await fetch(`${BASE_URL}/api/reports`);
        const data = await res.json();
        return data.success && data.data !== null;
    });

    // Business stats
    await testAPI('GET /api/reports - Business Stats', async () => {
        const res = await fetch(`${BASE_URL}/api/reports?type=business&businessId=test123`);
        const data = await res.json();
        return data.success;
    });
}

// Test Campaigns API
async function testCampaignsAPI() {
    let campaignId = '';

    // Create campaign
    await testAPI('POST /api/campaigns - Create Campaign', async () => {
        const res = await fetch(`${BASE_URL}/api/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: 'test_biz_123',
                businessName: 'Test Business',
                title: 'Test Campaign',
                description: 'Test description',
                duration: 7,
                budget: 500,
                placement: 'featured'
            })
        });
        const data = await res.json();
        if (data.success) campaignId = data.data.id;
        return data.success;
    });

    // Get all campaigns
    await testAPI('GET /api/campaigns - Get All', async () => {
        const res = await fetch(`${BASE_URL}/api/campaigns`);
        const data = await res.json();
        return data.success && Array.isArray(data.data);
    });

    // Get business campaigns
    await testAPI('GET /api/campaigns - By Business', async () => {
        const res = await fetch(`${BASE_URL}/api/campaigns?businessId=test_biz_123`);
        const data = await res.json();
        return data.success && Array.isArray(data.data);
    });

    // Update campaign status
    if (campaignId) {
        await testAPI('PATCH /api/campaigns - Update Status', async () => {
            const res = await fetch(`${BASE_URL}/api/campaigns`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: campaignId, status: 'active' })
            });
            const data = await res.json();
            return data.success;
        });
    }
}

// Test Settings APIs
async function testSettingsAPI() {
    // Get user settings
    await testAPI('GET /api/customer/settings - Get User Settings', async () => {
        const res = await fetch(`${BASE_URL}/api/customer/settings?userId=test_user`);
        const data = await res.json();
        return data.success;
    });

    // Update user settings
    await testAPI('PUT /api/customer/settings - Save User Settings', async () => {
        const res = await fetch(`${BASE_URL}/api/customer/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test_user',
                language: 'en',
                notifications: { email: true, push: true }
            })
        });
        const data = await res.json();
        return data.success;
    });

    // Get platform settings
    await testAPI('GET /api/admin/settings - Get Platform Settings', async () => {
        const res = await fetch(`${BASE_URL}/api/admin/settings`);
        const data = await res.json();
        return data.success && data.data !== null;
    });

    // Update platform settings
    await testAPI('PUT /api/admin/settings - Save Platform Settings', async () => {
        const res = await fetch(`${BASE_URL}/api/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adminId: 'test_admin',
                commissionRate: 10
            })
        });
        const data = await res.json();
        return data.success;
    });
}

// Test Social API
async function testSocialAPI() {
    // Track share
    await testAPI('POST /api/social - Track Share', async () => {
        const res = await fetch(`${BASE_URL}/api/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'share',
                userId: 'test_user',
                contentType: 'event',
                contentId: 'event_123',
                platform: 'whatsapp'
            })
        });
        const data = await res.json();
        return data.success;
    });

    // Follow business
    await testAPI('POST /api/social - Follow Business', async () => {
        const res = await fetch(`${BASE_URL}/api/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'follow',
                userId: 'test_user',
                businessId: 'biz_123'
            })
        });
        const data = await res.json();
        return data.success;
    });

    // Get followers
    await testAPI('GET /api/social - Get Followers', async () => {
        const res = await fetch(`${BASE_URL}/api/social?type=followers&businessId=biz_123`);
        const data = await res.json();
        return data.success;
    });

    // Get following
    await testAPI('GET /api/social - Get Following', async () => {
        const res = await fetch(`${BASE_URL}/api/social?type=following&userId=test_user`);
        const data = await res.json();
        return data.success;
    });

    // Unfollow business
    await testAPI('POST /api/social - Unfollow Business', async () => {
        const res = await fetch(`${BASE_URL}/api/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'unfollow',
                userId: 'test_user',
                businessId: 'biz_123'
            })
        });
        const data = await res.json();
        return data.success;
    });
}

// Run all tests
async function runTests() {
    console.log('\n🧪 Running API Tests for New Features\n');
    console.log('='.repeat(50));

    console.log('\n📊 Reports API Tests\n');
    await testReportsAPI();

    console.log('\n📢 Campaigns API Tests\n');
    await testCampaignsAPI();

    console.log('\n⚙️ Settings API Tests\n');
    await testSettingsAPI();

    console.log('\n📱 Social API Tests\n');
    await testSocialAPI();

    // Summary
    console.log('\n' + '='.repeat(50));
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);

    if (passed < total) {
        console.log('Failed tests:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  ❌ ${r.name}${r.error ? `: ${r.error}` : ''}`);
        });
    }

    process.exit(passed === total ? 0 : 1);
}

runTests().catch(console.error);
