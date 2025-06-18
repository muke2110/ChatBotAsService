const { sequelize } = require('./models');

async function runAllMigrations() {
  try {
    console.log('🚀 Starting comprehensive migration process...');
    
    // Step 1: Create ChatbotWidgets table first
    console.log('\n📋 Step 1: Creating ChatbotWidgets table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "chatbot_widgets" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "widgetId" VARCHAR(255) UNIQUE NOT NULL,
        "name" VARCHAR(255) NOT NULL DEFAULT 'Chatbot Widget',
        "description" TEXT,
        "s3Prefix" VARCHAR(255) NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "settings" JSONB DEFAULT '{"theme":{"primaryColor":"#0ea5e9","textColor":"#ffffff","backgroundColor":"#1f2937"},"position":"bottom-right","welcomeMessage":"Hello! How can I help you today?","botName":"AI Assistant"}',
        "widgetOrder" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ ChatbotWidgets table created successfully');
    
    // Step 2: Add widgetId column to documents table
    console.log('\n📋 Step 2: Adding widgetId column to documents table...');
    await sequelize.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS "widgetId" UUID REFERENCES chatbot_widgets(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);
    console.log('✅ widgetId column added successfully');
    
    // Step 3: Create index for better performance
    console.log('\n📋 Step 3: Creating indexes...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_widget_id ON documents("widgetId");
      CREATE INDEX IF NOT EXISTS idx_chatbot_widgets_user_id ON chatbot_widgets("userId");
      CREATE INDEX IF NOT EXISTS idx_chatbot_widgets_widget_id ON chatbot_widgets("widgetId");
    `);
    console.log('✅ Indexes created successfully');
    
    // Step 4: Verify all tables and columns exist
    console.log('\n📋 Step 4: Verifying migration results...');
    
    const [widgetTable] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'chatbot_widgets';
    `);
    
    const [widgetColumn] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'widgetId';
    `);
    
    if (widgetTable.length > 0 && widgetColumn.length > 0) {
      console.log('✅ All migrations completed successfully!');
      console.log('\n📊 Migration Summary:');
      console.log('   - ChatbotWidgets table: ✅ Created');
      console.log('   - widgetId column: ✅ Added to documents table');
      console.log('   - Indexes: ✅ Created for performance');
    } else {
      console.log('❌ Migration verification failed');
      console.log('   - ChatbotWidgets table exists:', widgetTable.length > 0);
      console.log('   - widgetId column exists:', widgetColumn.length > 0);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runAllMigrations(); 