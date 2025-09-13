// backend/src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyShopifyWebhook } = require('../utils/shopifyVerify');
const { ingestionQueue } = require('../services/queue');

router.post('/shopify', async (req, res) => {
  try {
    if (!verifyShopifyWebhook(req)) {
      return res.status(401).send('Invalid webhook signature');
    }
    const topic = req.get('X-Shopify-Topic') || '';
    const shop = req.get('X-Shopify-Shop-Domain') || '';

    let tenant = await prisma.tenant.findUnique({ where: { shopDomain: shop } });
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: { name: shop, shopDomain: shop }});
    }

    let store = await prisma.store.findFirst({ where: { domain: shop, tenantId: tenant.id }});
    if (!store) {
      store = await prisma.store.create({ data: { name: shop, domain: shop, tenantId: tenant.id }});
    }

    const payload = req.body;

    // enqueue job only — worker will perform DB upserts
    if (topic.startsWith('customers')) {
      await ingestionQueue.add('customer', { storeId: store.id, payload }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
    } else if (topic.startsWith('orders')) {
      await ingestionQueue.add('order', { storeId: store.id, payload }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 }});
    } else if (topic.startsWith('products')) {
      await ingestionQueue.add('product', { storeId: store.id, payload }, { attempts: 3 });
    } else {
      // unknown topic: still accept webhook but ignore or log
      console.warn('Unhandled Shopify topic:', topic);
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error', err);
    res.status(500).send('error');
  }
});

module.exports = router;
