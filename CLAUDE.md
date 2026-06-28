# Restaurant Digital — Context File

## O que é este projeto
Sistema de cardápio digital para restaurante construído com arquitetura de microserviços e comunicação por filas. Criado como projeto técnico demonstrando Next.js, NestJS, RabbitMQ e deploy independente de serviços.

## Regras absolutas de desenvolvimento
- NUNCA usar chamadas HTTP diretas entre serviços
- TODA comunicação entre serviços é exclusivamente via filas RabbitMQ
- CADA serviço tem seu próprio banco de dados — nenhum serviço acessa o banco de outro
- SEMPRE usar TypeScript com tipagem estrita
- SEMPRE importar os tipos de eventos de @restaurant/shared-types
- NUNCA duplicar interfaces de eventos — elas existem apenas em shared-types

## Stack
- Frontend: Next.js 14 com App Router e TypeScript
- Serviços: NestJS com TypeScript
- Fila: RabbitMQ via @golevelup/nestjs-rabbitmq
- Banco order-service: Supabase (PostgreSQL)
- Banco sale-service: Supabase (PostgreSQL)
- Banco kitchen-service: Redis (Upstash)
- Estilização: Tailwind CSS
- Deploy frontend: Vercel
- Deploy serviços: Render
- Fila produção: CloudAMQP
- Redis produção: Upstash

## Estrutura do monorepo
services/order-service      → Cria e confirma pedidos. Publica: order.created, order.confirmed

services/kitchen-service    → Gerencia fila da cozinha. Consome: order.confirmed. Publica: kitchen.queued, kitchen.status_updated

services/sale-service       → Agrupa pedidos por mesa, fecha comanda. Consome: order.confirmed. Publica: sale.closed

services/notification-service → Dispara WebSocket para o frontend. Consome: kitchen.status_updated, sale.closed, notify.table

apps/web                    → Frontend do cliente na mesa (cardápio, carrinho, status)

apps/kitchen                → Tela da cozinha (fila em tempo real)

apps/waiter                 → Painel do garçom (comandas, fechamento)

packages/shared-types       → Interfaces e tipos dos eventos das filas

## Eventos das filas (contratos)
| Evento | Publicado por | Consumido por |
|---|---|---|
| order.created | order-service | order-service (interno) |
| order.confirmed | order-service | kitchen-service, sale-service |
| kitchen.queued | kitchen-service | notification-service |
| kitchen.status_updated | kitchen-service | notification-service |
| notify.table | notification-service | apps/web (WebSocket) |
| sale.closed | sale-service | notification-service |

## Variáveis de ambiente por serviço

### order-service
RABBITMQ_URL=
SUPABASE_URL=
SUPABASE_KEY=
PORT=3001

### kitchen-service
RABBITMQ_URL=
REDIS_URL=
PORT=3002

### sale-service
RABBITMQ_URL=
SUPABASE_URL=
SUPABASE_KEY=
PORT=3003

### notification-service
RABBITMQ_URL=
PORT=3004

## Status do projeto
- [x] Estrutura do monorepo criada
- [x] docker-compose.yml configurado
- [x] shared-types com contratos das filas
- [x] order-service
- [x] kitchen-service
- [x] sale-service
- [ ] notification-service
- [ ] apps/web
- [ ] apps/kitchen
- [ ] apps/waiter
- [ ] deploy
