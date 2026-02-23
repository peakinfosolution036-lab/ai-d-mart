import { searchEvents, globalSearch, putDataItem } from '../src/lib/dynamodb';

async function testSearch() {
    process.env.APP_AWS_REGION = 'ap-south-1';
    process.env.DYNAMODB_DATA_TABLE = 'ai-d-mart-data';
    process.env.DYNAMODB_USERS_TABLE = 'ai-d-mart-users';

    console.log('--- Testing Search System ---');

    // 1. Seed dummy data
    console.log('Seeding test event...');
    await putDataItem('event', 'test-event-1', {
        title: 'Tech Expo 2026',
        location: 'Mumbai',
        date: '2026-05-20',
        category: 'Expo',
        description: 'Latest tech gadgets'
    });

    // 2. Test Event Search
    console.log('Searching for Mumbai Expo...');
    const mumbaiEvents = await searchEvents({ location: 'Mumbai', category: 'Expo' });
    console.log(`Found ${mumbaiEvents.length} events:`, mumbaiEvents[0]?.title);

    // 3. Test Global Search
    console.log('Testing Global Search for "Tech"...');
    const globalResults = await globalSearch('Tech', ['event', 'job']);
    console.log('Global results counts:', {
        events: globalResults.event?.length,
        jobs: globalResults.job?.length
    });

    console.log('--- Search Test Complete ---');
}

// Note: This script requires proper AWS credentials in the environment to run.
// testSearch().catch(console.error);
console.log('Test script ready. (Execution requires AWS environment)');
