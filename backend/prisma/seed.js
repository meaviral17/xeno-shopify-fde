const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({ data: { name: 'dev-store', shopDomain: 'dev-store.myshopify.com' }});
  const store = await prisma.store.create({ data: { name: 'Dev Store', domain: 'dev-store.myshopify.com', tenantId: tenant.id }});
  const c = await prisma.customer.create({ data: { shopId: '1001', email: 'alice@example.com', firstName: 'Alice', storeId: store.id, totalSpent: 100 }});
  await prisma.product.create({ data: { shopId: 'p1', title: 'Blue Shirt', price: 29.99, storeId: store.id }});
  await prisma.order.create({ data: { shopId: 'o1', totalPrice: 29.99, storeId: store.id, customerId: c.id }});
}
main()
  .then(() => { console.log('seed done'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
