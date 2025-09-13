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
  const totalPrice = parseFloat(payload.total_price || payload.current_total_price || 0);

  console.log("UPSERT ORDER CALLED:", storeId, shopId);

  // Link to customer if exists
  const customerShopId = payload.customer?.id ? String(payload.customer.id) : null;
  const customer = customerShopId
    ? await prisma.customer.findUnique({ where: { shopId: customerShopId } })
    : null;
  const customerId = customer ? customer.id : null;

  // Upsert order
  await prisma.order.upsert({
    where: { shopId },
    update: { totalPrice, customerId, storeId },
    create: {
      shopId,
      totalPrice,
      customerId,
      storeId,
      createdAt: new Date(payload.created_at || Date.now())
    }
  });

  // Update customer's totalSpent
  if (customerId) {
    const sum = await prisma.order.aggregate({
      where: { customerId },
      _sum: { totalPrice: true }
    });
    await prisma.customer.update({
      where: { id: customerId },
      data: { totalSpent: sum._sum.totalPrice || 0 }
    });
  }
}

module.exports = { upsertCustomer, upsertProduct, upsertOrder };
