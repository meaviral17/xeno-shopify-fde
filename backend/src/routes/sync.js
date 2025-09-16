const express = require('express');
const router = express.Router();
const { syncAllForTenant } = require('../services/syncService');

// POST /sync/full?tenantId=1
router.post('/full', async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId, 10);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenantId' });
    }

    // Wait for sync and capture summary
    const summary = await syncAllForTenant(tenantId);

    res.json({
      message: `✅ Full sync complete for tenant ${tenantId}`,
      ...summary
    });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
