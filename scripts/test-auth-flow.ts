#!/usr/bin/env tsx
/**
 * Test Authentication Flow
 * Tests all auth endpoints to ensure they work properly
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEndpoint(name: string, url: string, options: any) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok && data.success) {
            console.log(`✅ ${name} - PASSED`);
            return { success: true, data };
        } else {
            console.log(`❌ ${name} - FAILED`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.error || 'Unknown error'}`);
            return { success: false, error: data.error };
        }
    } catch (error: any) {
        console.log(`❌ ${name} - ERROR`);
        console.log(`   ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🔐 Authentication Flow Test Suite\n');
    console.log('━'.repeat(60));

    const results = {
        passed: 0,
        failed: 0,
        tests: [] as any[]
    };

    // Test 1: Health check
    const health = await testEndpoint(
        'Health Check',
        `${BASE_URL}/api/health`,
        { method: 'GET' }
    );
    health.success ? results.passed++ : results.failed++;
    results.tests.push({ name: 'Health Check', ...health });

    // Test 2: Login with invalid credentials
    const invalidLogin = await testEndpoint(
        'Login - Invalid Credentials',
        `${BASE_URL}/api/auth/login`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nonexistent@example.com',
                password: 'wrongpassword',
                role: 'CUSTOMER'
            })
        }
    );
    // This should fail, so we expect success: false
    !invalidLogin.success ? results.passed++ : results.failed++;
    results.tests.push({ name: 'Login - Invalid', ...invalidLogin });

    // Test 3: Get current user (unauthenticated)
    const unauthMe = await testEndpoint(
        'Get User - Unauthenticated',
        `${BASE_URL}/api/auth/me`,
        { method: 'GET' }
    );
    // Should fail
    !unauthMe.success ? results.passed++ : results.failed++;
    results.tests.push({ name: 'Get User - Unauth', ...unauthMe });

    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 Test Results:');
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   Total: ${results.passed + results.failed}`);
    console.log('\n' + '━'.repeat(60));

    console.log('\n📝 Summary:');
    results.tests.forEach(test => {
        const icon = test.success === undefined ? '⚠️' : test.success ? '✅' : '❌';
        console.log(`   ${icon} ${test.name}`);
    });

    console.log('\n');
}

runTests()
    .then(() => {
        console.log('✅ Test suite completed\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
