async function syncAllForTenant(tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
  
    // Ensure store exists
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
  
    const customers = await shopify.fetchAll(tenant.shopDomain, 'customers');
    for (const c of customers) await ingestion.upsertCustomer(storeId, c);
  
    const products = await shopify.fetchAll(tenant.shopDomain, 'products');
    for (const p of products) await ingestion.upsertProduct(storeId, p);
  
    const orders = await shopify.fetchAll(tenant.shopDomain, 'orders');
    for (const o of orders) await ingestion.upsertOrder(storeId, o);
  
    console.log(`✅ Full sync complete for tenant ${tenantId}`);
  
    // return a summary
    return {
      customersSynced: customers.length,
      productsSynced: products.length,
      ordersSynced: orders.length
    };
  }
  