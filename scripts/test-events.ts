import { events, eventBookings, putDataItem, getDataItem } from '../src/lib/dynamodb';

async function testEventsSystem() {
    process.env.APP_AWS_REGION = 'ap-south-1';
    process.env.DYNAMODB_DATA_TABLE = 'ai-d-mart-data';

    console.log('--- Testing Events System ---');

    const testEventId = 'test-evt-999';
    const testUserId = 'DI001';

    // 1. Create Event with Analytics
    console.log('Creating test event...');
    await events.create(testEventId, {
        title: 'Grand Tech Wedding',
        category: 'Wedding',
        location: 'Mumbai',
        date: '2026-12-12',
        price: 500,
        status: 'pending'
    });

    // 2. Track View
    console.log('Tracking view...');
    await events.trackView(testEventId);
    let event = await events.get(testEventId);
    console.log('Views after track:', event.views); // Should be 1

    // 3. Approve Event
    console.log('Approving event...');
    await events.update(testEventId, { status: 'ACTIVE' });
    event = await events.get(testEventId);
    console.log('New Status:', event.status);

    // 4. Test Booking
    console.log('Simulating Booking...');
    await eventBookings.create('test-bkg-1', {
        userId: testUserId,
        eventId: testEventId,
        amount: 500,
        eventTitle: 'Grand Tech Wedding'
    });

    // 5. Check Analytics after booking
    event = await events.get(testEventId);
    console.log('Analytics after booking:', {
        bookings: event.bookings,
        revenue: event.revenue
    });

    console.log('--- Events Test Complete ---');
}

// testEventsSystem().catch(console.error);
console.log('Test script ready. (Execution requires AWS environment)');
