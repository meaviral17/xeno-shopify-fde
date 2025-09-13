// backend/src/services/shopifyService.js
const axios = require('axios');
const prisma = require('../prismaClient');
const ingestion = require('./ingestion');

/**
 * Fetch all pages from a Shopify REST API endpoint
 */
async function fetchAll(url, headers, extractorKey, handler) {
  let nextUrl = url;
  while (nextUrl) {
    const resp = await axios.get(nextUrl, { headers });
    const items = resp.data[extractorKey] || [];

    for (const item of items) {
      await handler(item);
    }

    // Look for pagination info in Link header
    const link = resp.headers['link'] || resp.headers['Link'] || '';
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = match ? match[1] : null;
  }
}

/**
 * Sync all customers, products, orders for one tenant
 */
async function syncAllForTenant(tenant) {
  const token = tenant.accessToken || process.env.SHOPIFY_ADMIN_TOKEN;
  const domain = tenant.shopDomain;
  if (!token || !domain) {
    throw new Error('Missing tenant accessToken or shopDomain');
  }

  const headers = {
    'X-Shopify-Access-Token': token,
    'Content-Type': 'application/json'
  };

  // Find or create store for tenant
  let store = await prisma.store.findFirst({ where: { tenantId: tenant.id } });
  if (!store) {
    store = await prisma.store.create({
      data: { name: domain, domain, tenantId: tenant.id }
    });
  }

  // Customers
  await fetchAll(
    `https://${domain}/admin/api/2024-10/customers.json?limit=250`,
    headers,
    'customers',
    async (c) => await ingestion.upsertCustomer(store.id, c)
  );

  // Products
  await fetchAll(
    `https://${domain}/admin/api/2024-10/products.json?limit=250`,
    headers,
    'products',
    async (p) => await ingestion.upsertProduct(store.id, p)
  );

  // Orders
  await fetchAll(
    `https://${domain}/admin/api/2024-10/orders.json?limit=250&status=any`,
    headers,
    'orders',
    async (o) => await ingestion.upsertOrder(store.id, o)
  );

  return { message: `Full sync complete for tenant ${tenant.id}` };
}

module.exports = { syncAllForTenant };
