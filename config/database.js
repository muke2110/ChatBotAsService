const { Sequelize } = require('sequelize');

// Using DATABASE_URL if available, else falling back to individual environment variables
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false
        }
    })
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false
        }
    });

// Sync Models with safer options
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        const syncOptions = {
            force: false,  // Never force sync
            alter: false  // Never alter tables automatically
        };

        await sequelize.sync(syncOptions);
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Re-throw to handle in the calling code
    }
};

module.exports = { sequelize, syncDatabase };