# Restaurant Digital

A digital menu and order management system for restaurants, built as an event-driven microservices architecture. Customers order from their table via a web app, the kitchen receives orders in real time, and waiters manage table billing — all services communicate asynchronously through a message broker instead of direct HTTP calls.

This project was built as a technical showcase of Next.js, NestJS, RabbitMQ, and independently deployable services.

## Architecture

Each service owns its own database and never reaches into another service's data. All cross-service communication happens exclusively through RabbitMQ queues.

```
                                   ┌─────────────────┐
                                   │   apps/web       │  (customer menu, cart, order status)
                                   │   apps/kitchen   │  (live kitchen queue)
                                   │   apps/waiter     │  (table management, billing)
                                   └────────┬─────────┘
                                            │ WebSocket
                                            │
                                  ┌─────────▼──────────┐
                                  │ notification-service │
                                  └─────────▲──────────┘
                                            │ consumes: kitchen.status_updated,
                                            │           sale.closed, notify.table
                            ┌───────────────┴───────────────┐
                            │           RabbitMQ            │
                            │  (order.created, order.confirmed,
                            │   kitchen.queued, kitchen.status_updated,
                            │   sale.closed, notify.table)
                            └───┬──────────────┬────────────┘
                publishes /     │              │     consumes: order.confirmed
                consumes        │              │
                  ┌─────────────▼───┐    ┌─────▼──────────┐
                  │  order-service   │    │ kitchen-service │
                  │  (Supabase)      │    │ (Redis)         │
                  └─────────────────┘    └─────────────────┘
                            │
                            │ order.confirmed
                            ▼
                  ┌─────────────────┐
                  │   sale-service   │
                  │   (Supabase)     │
                  └─────────────────┘
```

| Event | Published by | Consumed by |
|---|---|---|
| `order.created` | order-service | order-service (internal) |
| `order.confirmed` | order-service | kitchen-service, sale-service |
| `kitchen.queued` | kitchen-service | notification-service |
| `kitchen.status_updated` | kitchen-service | notification-service |
| `notify.table` | notification-service | apps/web (WebSocket) |
| `sale.closed` | sale-service | notification-service |

All event contracts are shared via [`packages/shared-types`](packages/shared-types) — no service redefines another service's event shape.

## Tech stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Services:** NestJS + TypeScript
- **Messaging:** RabbitMQ via `@golevelup/nestjs-rabbitmq`
- **Databases:** Supabase (PostgreSQL) for `order-service` and `sale-service`; Redis (Upstash) for `kitchen-service`
- **Deployment:** Vercel (frontends), Render (services), CloudAMQP (production queue), Upstash (production Redis)

## Monorepo structure

```
restaurant-digital/
├── services/
│   ├── order-service/          # Creates and confirms orders
│   ├── kitchen-service/        # Manages the kitchen queue
│   ├── sale-service/           # Groups orders by table, closes the bill
│   └── notification-service/   # Pushes real-time updates over WebSocket
├── apps/
│   ├── web/                    # Customer-facing menu and order tracking
│   ├── kitchen/                # Kitchen display screen
│   └── waiter/                 # Waiter panel for table/bill management
├── packages/
│   └── shared-types/           # Shared event contracts for the queues
└── docker-compose.yml          # Local RabbitMQ + Redis
```

## Running locally

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### 1. Start the infrastructure

```bash
docker-compose up -d
```

This starts:

| Service | Port | Notes |
|---|---|---|
| RabbitMQ (AMQP) | `5672` | user: `admin`, password: `admin` |
| RabbitMQ Management UI | `15672` | http://localhost:15672 |
| Redis | `6379` | |

### 2. Configure environment variables

Copy `.env.example` to `.env` in each service under `services/` and fill in the values:

```bash
cp services/order-service/.env.example services/order-service/.env
cp services/kitchen-service/.env.example services/kitchen-service/.env
cp services/sale-service/.env.example services/sale-service/.env
cp services/notification-service/.env.example services/notification-service/.env
```

### 3. Install dependencies and run a service

```bash
cd services/order-service
npm install
npm run start:dev
```

Repeat for each service you want to run.

## Services and ports

| Service | Port | Responsibility |
|---|---|---|
| order-service | `3001` | Order creation and confirmation |
| kitchen-service | `3002` | Kitchen queue management |
| sale-service | `3003` | Table billing and sale closing |
| notification-service | `3004` | Real-time WebSocket notifications |

## Project status

See [CLAUDE.md](CLAUDE.md) for development rules, event contracts, and current implementation status.
