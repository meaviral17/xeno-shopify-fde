require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Import route modules
const webhooks = require('./routes/webhooks');
const sync = require('./routes/sync');
const analytics = require('./routes/analytics');
const tenants = require('./routes/tenants');

const app = express();

// Middleware: parse JSON & keep raw body for webhook verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount routes (only if they export a router)
if (typeof webhooks === 'function') app.use('/webhooks', webhooks);
if (typeof sync === 'function') app.use('/sync', sync);
if (typeof analytics === 'function') app.use('/analytics', analytics);
if (typeof tenants === 'function') app.use('/tenants', tenants);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend listening on ${PORT}`));
