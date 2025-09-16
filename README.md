## 📄 README.md

````markdown
# Xeno FDE Assignment – Shopify Data Ingestion & Analytics

This project implements a **multi-tenant backend** for ingesting data from Shopify stores (via Webhooks & Admin API Sync) and exposing **analytics endpoints**.  
It was built as part of the **Xeno FDE Internship Assignment – 2025**.

Built by: Aviral Srivastava 22BAI1187
College: Vellore Institute of Technology
---

## 📌 Features

- **Shopify Webhooks** ingestion for `customers`, `orders`, and `products`
- **Full Sync API** to backfill historical data from Shopify
- **Multi-tenant support** (Tenant → Store → Data hierarchy)
- **Queue-based ingestion** using BullMQ + Redis
- **PostgreSQL + Prisma ORM** for persistence
- **Analytics APIs** for revenue, top customers, and product insights

---

## 🏗️ Architecture


---

## ⚙️ Tech Stack

* **Node.js + Express** – REST APIs
* **Prisma ORM** – PostgreSQL schema & queries
* **Redis + BullMQ** – Job queues
* **Docker Compose** – Local Postgres & Redis
* **Nodemon** – Dev server reloads

---

## 🚀 Setup

### 1. Clone Repo

```bash
git clone https://github.com/<your-username>/xeno-shopify-fde.git
cd xeno-shopify-fde/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Postgres + Redis via Docker

```bash
docker compose up -d
```

### 4. Setup Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed Tenant (optional)

```bash
npx prisma studio
# Insert a Tenant with your Shopify dev store domain
```

### 6. Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/xeno"
PORT=4000
REDIS_URL=redis://localhost:6379

SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_secret
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxx
JWT_SECRET=any_random_string
```

---

## ▶️ Running

### Backend API

```bash
npm run dev
```

### Worker

```bash
npm run worker
```

---

## 📡 API Endpoints

### Health Check

```
GET /health
```

### Webhooks (Shopify)

```
POST /webhooks/shopify
```

### Full Sync

```
POST /sync/full?tenantId=1
```

Response:

```json
{
  "message": "✅ Full sync complete for tenant 1",
  "customersSynced": 5,
  "productsSynced": 3,
  "ordersSynced": 2
}
```

### Analytics (examples)

```
GET /analytics/summary?storeId=1
GET /analytics/revenue?storeId=1
GET /analytics/top-customers?storeId=1
```

---

## 📂 Project Structure

```
backend/
  src/
    index.js            # Express app entry
    prismaClient.js     # Prisma setup
    routes/
      sync.js
      webhooks.js
      analytics.js
      tenants.js
    services/
      syncService.js
      ingestion.js
      shopifyService.js
      queue.js
    worker.js           # BullMQ worker
  prisma/
    schema.prisma
    seed.js
  docker-compose.yml
```

---

## ✅ Status

* [x] Backend setup with Express + Prisma
* [x] Dockerized Postgres + Redis
* [x] Webhook endpoint + verification
* [x] Full sync endpoint with ingestion
* [ ] Analytics APIs (Task 3)
* [ ] Documentation polish + deployment

---

## 📖 License

MIT

```


