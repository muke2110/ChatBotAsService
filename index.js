const express = require('express');
const router = express.Router();
const embedRoutes = require('./routes/embedRoutes');
const queryRoutes = require('./routes/queryRoutes');
const paymentRoutes = require('./routes/paymentRoutes')
const authRoutes = require('./routes/authRoutes')

router.use('/embed', embedRoutes);
router.use('/query', queryRoutes);
router.use('/payments',paymentRoutes)
router.use('/auth',authRoutes)

module.exports = router