import { createShopTables } from './create-shop-tables';
import { seedShopProducts } from './seed-shop-products';

async function setupShop() {
    try {
        console.log('Setting up shop...');
        
        // Create tables
        await createShopTables();
        
        // Wait a bit for table to be fully ready
        console.log('Waiting for table to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Seed with sample data
        await seedShopProducts();
        
        console.log('Shop setup completed successfully!');
    } catch (error) {
        console.error('Error setting up shop:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    setupShop();
}