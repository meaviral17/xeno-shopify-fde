// backend/src/worker.js
require('dotenv').config();
const { Worker } = require('bullmq');
const { dlq } = require('./services/queue');
const ingestion = require('./services/ingestion');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const worker = new Worker('ingestion', async job => {
  const { name, data } = job;
  const { storeId, payload } = data;
  logger.info({ job: job.id, name }, 'processing job');
  if (job.name === 'customer' || name === 'customer') {
    await ingestion.upsertCustomer(storeId, payload);
  } else if (job.name === 'order' || name === 'order') {
    await ingestion.upsertOrder(storeId, payload);
  } else if (job.name === 'product' || name === 'product') {
    await ingestion.upsertProduct(storeId, payload);
  } else {
    logger.warn({ jobId: job.id, name }, 'unknown job name');
  }
  logger.info({ job: job.id }, 'job completed');
  return true;
}, { connection: require('./services/queue').connection });

// move exhausted jobs to DLQ
worker.on('failed', async (job, err) => {
  logger.error({ jobId: job?.id, err: err?.message }, 'job failed');
  const attempts = job?.opts?.attempts || 0;
  if (job.attemptsMade >= attempts) {
    logger.info({ jobId: job.id }, 'moving job to DLQ');
    await dlq.add('dead', { jobName: job.name, data: job.data, failedReason: err.message });
  }
});

worker.on('error', err => {
  logger.error({ err }, 'worker error');
});

logger.info('Worker started for queue: ingestion');
