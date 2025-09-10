const crypto = require('crypto');

function verifyShopifyWebhook(req) {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256') || '';
  const body = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const secret = process.env.SHOPIFY_API_SECRET || '';
  const generated = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(hmacHeader));
  } catch (e) {
    return false;
  }
}

module.exports = { verifyShopifyWebhook };
