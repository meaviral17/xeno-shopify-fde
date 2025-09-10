const express = require('express');
const router = express.Router();

// placeholder analytics
router.get('/summary', async (req, res) => res.json({ totalCustomers: 0, totalOrders: 0, revenue: 0 }));
module.exports = router;
