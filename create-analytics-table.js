const { sequelize } = require('./models');

async function createAnalyticsTable() {
  try {
    console.log('🚀 Creating QueryAnalytics table...');
    
    // Create QueryAnalytics table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "query_analytics" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "widgetId" UUID NOT NULL REFERENCES chatbot_widgets(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "query" TEXT NOT NULL,
        "response" TEXT,
        "responseTime" INTEGER NOT NULL,
        "status" "public"."enum_query_analytics_status" NOT NULL,
        "userAgent" TEXT,
        "ipAddress" VARCHAR(255),
        "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ QueryAnalytics table created successfully');
    
    // Create enum type for status if it doesn't exist
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."enum_query_analytics_status" AS ENUM('success', 'error', 'no_documents');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Status enum created successfully');
    
    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_query_analytics_widget_id ON query_analytics("widgetId");
      CREATE INDEX IF NOT EXISTS idx_query_analytics_timestamp ON query_analytics("timestamp");
      CREATE INDEX IF NOT EXISTS idx_query_analytics_status ON query_analytics("status");
    `);
    
    console.log('✅ Indexes created successfully');
    
    // Verify the table was created
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'query_analytics';
    `);
    
    if (results.length > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('\n📊 Analytics Table Summary:');
      console.log('   - QueryAnalytics table: ✅ Created');
      console.log('   - Status enum: ✅ Created');
      console.log('   - Indexes: ✅ Created for performance');
    } else {
      console.log('❌ Migration failed - table not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createAnalyticsTable(); 