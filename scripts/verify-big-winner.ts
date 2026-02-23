// @ts-nocheck
// using global fetch

const BASE_URL = 'http://localhost:3000';

async function testBigWinnerFlow() {
    console.log('🚀 Starting Big Winner System Verification...');

    try {
        // 1. Create Season
        console.log('\n1. Creating Season...');
        const seasonRes = await fetch(`${BASE_URL}/api/admin/seasons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Season 1',
                type: 'daily',
                startDate: '2024-06-01',
                endDate: '2024-06-30',
                duration: 30
            })
        });
        const seasonData = await seasonRes.json();
        if (!seasonData.success) throw new Error('Failed to create season: ' + JSON.stringify(seasonData));
        const seasonId = seasonData.data.id;
        console.log('✅ Season Created:', seasonId);

        // 2. Create Product linked to Season
        console.log('\n2. Creating Product...');
        const productRes = await fetch(`${BASE_URL}/api/admin/lucky-draw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create-product',
                name: 'Daily iPhone Draw',
                description: 'Win an iPhone!',
                pricePerNumber: 50,
                totalNumbers: 100,
                image: '/images/iphone.jpg',
                seasonId: seasonId,
                drawType: 'daily',
                isJackpot: true
            })
        });
        const productData = await productRes.json();
        // Admin API currently returns success:true but maybe not the full object in data depending on implementation. 
        // My implementation returns message/success.
        if (!productData.success) throw new Error('Failed to create product');
        console.log('✅ Product Created');

        // 3. Fetch Products (User View)
        console.log('\n3. Fetching Products for Season...');
        const fetchRes = await fetch(`${BASE_URL}/api/lucky-draw/products?seasonId=${seasonId}&drawType=daily`);
        const fetchData = await fetchRes.json();
        if (fetchData.data.length === 0) throw new Error('Product not found in user view');
        const productId = fetchData.data[0].id;
        console.log('✅ Product Found:', productId);

        // 4. Test Booking (Free Ticket)
        console.log('\n4. Testing Free Booking...');
        const bookingRes = await fetch(`${BASE_URL}/api/lucky-draw/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: productId,
                userId: 'test-user-' + Date.now(),
                userName: 'Test User',
                numbers: [5], // 1 number
                isFreeRequest: true,
                participantName: 'Family Member'
            })
        });
        const bookingData = await bookingRes.json();
        if (!bookingData.success) throw new Error('Free booking failed: ' + JSON.stringify(bookingData));
        console.log('✅ Free Booking Successful:', bookingData.data.id);

        console.log('\n🎉 All Systems Go!');

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
}

testBigWinnerFlow();
