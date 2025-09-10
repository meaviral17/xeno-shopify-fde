const express = require('express');
const router = express.Router();

// placeholder tenants route
router.get('/', async (req, res) => res.json({ message: 'tenants route' }));
module.exports = router;
