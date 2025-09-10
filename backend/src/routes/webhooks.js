const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyShopifyWebhook } = require('../utils/shopifyVerify');
const ingestion = require('../services/ingestion');

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
    if (topic.startsWith('customers')) {
      await ingestion.upsertCustomer(store.id, payload);
    } else if (topic.startsWith('orders')) {
      await ingestion.upsertOrder(store.id, payload);
    } else if (topic.startsWith('products')) {
      await ingestion.upsertProduct(store.id, payload);
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error', err);
    res.status(500).send('error');
  }
});

module.exports = router;
