const { Sequelize } = require('sequelize');

// Using DATABASE_URL if available, else falling back to individual environment variables
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false
    })
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    });


// Sync Models
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        await sequelize.sync();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, syncDatabase };