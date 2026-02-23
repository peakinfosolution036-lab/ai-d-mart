import { createUsersTable } from './users';
import { createEventsTable } from './events';
import { createProductsTable } from './products';
import { createJobsTable } from './jobs';
import { createOffersTable } from './offers';
import { createRewardsTable } from './rewards';
import { createSettingsTable } from './settings';
import { createNotificationsTable } from './notifications';
import { createBusinessesTable } from './businesses';
import { createPromotionsTable } from './promotions';
import { createBookingsTable } from './bookings';
import { createLeadsTable } from './leads';

async function createAllTables() {
    console.log('🚀 Creating all DynamoDB tables...\n');

    try {
        await createUsersTable();
        await createEventsTable();
        await createProductsTable();
        await createJobsTable();
        await createOffersTable();
        await createRewardsTable();
        await createSettingsTable();
        await createNotificationsTable();
        await createBusinessesTable();
        await createPromotionsTable();
        await createBookingsTable();
        await createLeadsTable();

        console.log('\n✅ All DynamoDB tables created successfully!');
        console.log('\n📋 Tables created:');
        console.log('   - ai-d-mart-users (customers & admins)');
        console.log('   - ai-d-mart-data (events, products, jobs, offers, etc.)');
        console.log('   - ai-d-mart-settings');
        console.log('   - ai-d-mart-notifications');
        console.log('   - ai-d-mart-businesses');
        console.log('   - ai-d-mart-promotions');
        console.log('   - ai-d-mart-bookings');
        console.log('   - ai-d-mart-leads');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    }
}

createAllTables();