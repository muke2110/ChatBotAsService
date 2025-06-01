const express = require('express')
require('dotenv').config()
const { syncDatabase } = require('./config/database')
const route = require('./index')
const port = process.env.SERVER_PORT || 3000
const cors = require('cors')
require('./models/user.model');
require('./models//payment.model');
require('./models/plan.model');
require('./models/userPlan.model');
require('./models/client.model')

const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',route)

syncDatabase().then(() => {
    console.log('Database is ready!');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
});