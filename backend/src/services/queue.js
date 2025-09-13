// backend/src/services/queue.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Fix: BullMQ requires maxRetriesPerRequest: null
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

let ingestionQueue;
let ingestionScheduler;
let dlq;

try {
  // Try to require QueueScheduler (works if BullMQ version supports it)
  const { QueueScheduler } = require('bullmq');
  ingestionQueue = new Queue('ingestion', { connection });
  ingestionScheduler = new QueueScheduler('ingestion', { connection });
  dlq = new Queue('ingestion-dlq', { connection });
} catch (err) {
  // Fallback if QueueScheduler not available
  console.warn(
    'Warning: QueueScheduler not available or bullmq export mismatch — continuing without scheduler.'
  );
  ingestionQueue = new Queue('ingestion', { connection });
  dlq = new Queue('ingestion-dlq', { connection });
}

module.exports = { ingestionQueue, dlq, connection, ingestionScheduler };
