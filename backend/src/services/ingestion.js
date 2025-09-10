const prisma = require('../prismaClient');

async function upsertCustomer(storeId, payload) {
  const shopId = String(payload.id);
  const email = payload.email || null;
  const firstName = payload.first_name || payload.firstName || null;
  const lastName = payload.last_name || payload.lastName || null;
  await prisma.customer.upsert({
    where: { shopId },
    update: { email, firstName, lastName, storeId },
    create: { shopId, email, firstName, lastName, storeId }
  });
}

async function upsertProduct(storeId, payload) {
  const shopId = String(payload.id);
  const title = payload.title || payload.name || 'Untitled';
  const price = parseFloat(payload.variants?.[0]?.price || payload.price || 0);
  await prisma.product.upsert({
    where: { shopId },
    update: { title, price, storeId },
    create: { shopId, title, price, storeId }
  });
}

async function upsertOrder(storeId, payload) {
  const shopId = String(payload.id);
  const totalPrice = parseFloat(payload.total_price || payload.total_price_usd || payload.totalPrice || 0);
  const customerShopId = payload.customer ? String(payload.customer.id) : null;

  if (customerShopId) {
    await prisma.customer.upsert({
      where: { shopId: customerShopId },
      update: {},
      create: { shopId: customerShopId, storeId }
    });
  }

  const customer = customerShopId ? await prisma.customer.findUnique({ where: { shopId: customerShopId } }) : null;
  const customerId = customer ? customer.id : null;

  await prisma.order.upsert({
    where: { shopId },
    update: { totalPrice, customerId, storeId },
    create: { shopId, totalPrice, customerId, storeId }
  });

  if (customerId) {
    const sum = await prisma.order.aggregate({ where: { customerId }, _sum: { totalPrice: true } });
    await prisma.customer.update({
      where: { id: customerId },
      data: { totalSpent: sum._sum.totalPrice || 0 }
    });
  }
}

module.exports = { upsertCustomer, upsertProduct, upsertOrder };
