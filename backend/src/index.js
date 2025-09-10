require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webhooks = require('./routes/webhooks');
const sync = require('./routes/sync');
const analytics = require('./routes/analytics');
const tenants = require('./routes/tenants');

const app = express();

app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/webhooks', webhooks);
app.use('/sync', sync);
app.use('/analytics', analytics);
app.use('/tenants', tenants);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(Backend listening on ));
