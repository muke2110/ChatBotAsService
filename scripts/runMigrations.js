const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Sync all models (this will create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('Database models synchronized.');
    
    // Run the widget seeding migration manually
    const widgetSeedingMigration = require('../migrations/20241201_seed_widgets_for_existing_users');
    await widgetSeedingMigration.up(null, sequelize);
    console.log('Widget seeding migration completed.');
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 