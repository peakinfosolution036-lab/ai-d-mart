// @ts-nocheck
// using global fetch
const BASE_URL = 'http://localhost:3000';

async function verifyReports() {
    console.log('📊 Verifying Reports API...');
    try {
        const response = await fetch(`${BASE_URL}/api/admin/reports`);
        const data = await response.json();

        if (!data.success) throw new Error('API returned failure');
        if (typeof data.data.totalRevenue !== 'number') throw new Error('Invalid totalRevenue format');
        if (!Array.isArray(data.data.productPerformance)) throw new Error('Invalid productPerformance format');

        console.log('✅ Reports API OK');
        console.log('Revenue:', data.data.totalRevenue);
        console.log('Active Users:', data.data.activeUsers);
    } catch (e) {
        console.error('❌ Reports Verification Failed:', e.message);
    }
}

verifyReports();
