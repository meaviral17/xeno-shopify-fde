const express = require('express');
const router = express.Router();

// placeholder sync route
router.post('/full', async (req, res) => res.json({ message: 'sync started' }));
module.exports = router;
