// backend/src/services/syncService.js
const prisma = require('../prismaClient');
const ingestion = require('../services/ingestion');
const shopify = require('../services/shopifyService');

async function syncAllForTenant(tenantId) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

  // Ensure Store exists
  let store = await prisma.store.findFirst({ where: { tenantId: tenant.id, domain: tenant.shopDomain } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: tenant.name || tenant.shopDomain,
        domain: tenant.shopDomain,
        tenantId: tenant.id,
      },
    });
    console.log(`✅ Created new Store for tenant ${tenant.id}: ${store.domain}`);
  }

  const storeId = store.id;

  // Fetch & ingest Customers
  const customers = await shopify.fetchAll(tenant.shopDomain, 'customers');
  console.log(`Fetched ${customers.length} customers`);
  for (const c of customers) await ingestion.upsertCustomer(storeId, c);

  // Fetch & ingest Products
  const products = await shopify.fetchAll(tenant.shopDomain, 'products');
  console.log(`Fetched ${products.length} products`);
  for (const p of products) await ingestion.upsertProduct(storeId, p);

  // Fetch & ingest Orders
  const orders = await shopify.fetchAll(tenant.shopDomain, 'orders');
  console.log(`Fetched ${orders.length} orders`);
  for (const o of orders) await ingestion.upsertOrder(storeId, o);

  console.log(`✅ Full sync complete for tenant ${tenantId}`);
}

module.exports = { syncAllForTenant };
