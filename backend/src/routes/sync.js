// backend/src/routes/sync.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { syncAllForTenant } = require('../services/shopifyService');

// POST /sync/full?tenantId=1
router.post('/full', async (req, res) => {
  try {
    const tenantId = parseInt(req.query.tenantId, 10);
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const result = await syncAllForTenant(tenant);
    res.json(result);
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Sync failed', detail: err.message });
  }
});

module.exports = router;
