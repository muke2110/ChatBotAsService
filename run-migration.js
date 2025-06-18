const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('Running migration to add widgetId column...');
    
    // Add widgetId column to documents table
    await sequelize.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS "widgetId" UUID REFERENCES chatbot_widgets(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);
    
    console.log('widgetId column added successfully');
    
    // Add index for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_widget_id ON documents("widgetId");
    `);
    
    console.log('Index created successfully');
    
    // Verify the column was added
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'widgetId';
    `);
    
    if (results.length > 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('❌ Migration failed - column not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 