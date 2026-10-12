<div align="center">

# 🎧 Helpdesk SaaS

### A multi-tenant customer support platform built with NestJS, Prisma & PostgreSQL

*One application. Many companies. Fully isolated data.*

<br />

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI-85EA2D?style=flat&logo=swagger&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat)

<br />

[Overview](#-overview) •
[Architecture](#-architecture) •
[Multi-Tenancy](#-multi-tenancy) •
[Data Model](#-data-model) •
[Ticket Lifecycle](#-ticket-lifecycle) •
[Roadmap](#-roadmap) •
[Getting Started](#-getting-started) •
[License](#-license)

</div>

---

> [!NOTE]
> **Project status: active development.** The product design, database schema, and multi-tenancy strategy are finalized, and the NestJS + Prisma foundation is in place. Features are being delivered in **vertical slices** (controller → service → Prisma → PostgreSQL). The [Roadmap](#-roadmap) shows exactly what is done and what is next.

---

## 📌 Overview

**Helpdesk SaaS** is a simplified, Zendesk/Intercom-style platform where **many companies share one application** to manage their customer support — each with its own agents, teams, customers, and tickets, and **none of them able to see each other's data**.

```text
Amazon                         Noon
├── Agents                     ├── Agents
├── Teams                      ├── Teams
├── Customers                  ├── Customers
└── Tickets                    └── Tickets
        ▲                              ▲
        └────── same app, isolated data ┘
```

---

## ✨ Features (V1 scope)

| Area | Capabilities |
|------|--------------|
| 🏢 **Organizations** | Companies as tenants, with members and roles (`ADMIN`, `AGENT`) |
| 👤 **Users** | One global identity that can belong to multiple organizations with different roles |
| 🙋 **Customers** | End-users who contact support; can interact with multiple organizations |
| 👥 **Teams** | Group agents by function (Billing, Shipping, Technical Support…) |
| 🎫 **Tickets** | Status, priority, and flexible assignment to a team, an agent, both, or neither |
| 💬 **Comments** | Public replies and **internal notes** in a single table, separated by visibility |
| 🕒 **Ticket history** | Full audit trail of everything that happens to a ticket |
| 🔐 **Auth & RBAC** | JWT access + refresh tokens, guards, and organization-aware authorization |

---

## 🏗 Architecture

A classic layered NestJS architecture. The goal is to keep every layer easy to understand, test, and grow.

```mermaid
flowchart LR
    Client["🖥 Client<br/>Web · Mobile · API consumer"]

    subgraph App["NestJS Application"]
        direction TB
        Guards["🛡 Guards<br/>Authentication · Tenant · Roles"]
        Ctrl["Controllers<br/>routing + DTO validation"]
        Svc["Services<br/>business rules"]
        Prisma["Prisma Client<br/>type-safe data access"]
        Guards --> Ctrl --> Svc --> Prisma
    end

    DB[("🐘 PostgreSQL<br/>shared database")]
    Docs["📘 Swagger / OpenAPI"]

    Client -->|"HTTPS + JWT"| Guards
    Prisma --> DB
    Ctrl -.-> Docs
```

### Request lifecycle (illustrative: assigning a ticket)

Every write that touches multiple tables runs inside a transaction, so the ticket and its history never drift apart.

```mermaid
sequenceDiagram
    autonumber
    actor Agent
    participant Guards as Auth + Tenant + Role Guards
    participant Ctrl as TicketsController
    participant Svc as TicketsService
    participant DB as Prisma / PostgreSQL

    Agent->>Guards: Request with JWT
    Guards->>Guards: Verify token, org membership, role
    Guards->>Ctrl: Allowed
    Ctrl->>Ctrl: Validate DTO
    Ctrl->>Svc: assign(ticketId, dto)
    Svc->>DB: BEGIN transaction
    Svc->>DB: Load ticket (scoped by organization_id)
    Svc->>DB: Verify team and agent belong to the same organization
    Svc->>DB: Update ticket assignment
    Svc->>DB: Insert ticket_event (TICKET_ASSIGNED)
    Svc->>DB: COMMIT
    Svc-->>Ctrl: Updated ticket
    Ctrl-->>Agent: 200 OK
```

---

## 🏢 Multi-Tenancy

**Strategy: Shared Database + Shared Tables.**
A single PostgreSQL database; tenant-owned rows carry an `organization_id`. Isolation is a **core application responsibility**, enforced through guards and organization-scoped queries.

```mermaid
flowchart LR
    subgraph OrgA["🏢 Organization 100"]
        UA["Admins and Agents"]
    end

    subgraph OrgB["🏢 Organization 200"]
        UB["Admins and Agents"]
    end

    subgraph Table["🗄 tickets (one shared table)"]
        R1["#1 · org 100 · Payment problem"]
        R2["#2 · org 100 · Login problem"]
        R3["#3 · org 200 · Shipping problem"]
    end

    UA -->|"organization_id = 100"| R1
    UA -->|"organization_id = 100"| R2
    UB -->|"organization_id = 200"| R3
```

| id | organization_id | subject |
|----|-----------------|---------|
| 1 | 100 | Payment problem |
| 2 | 100 | Login problem |
| 3 | 200 | Shipping problem |

> Ticket `#3` must **never** be visible to a user who only belongs to organization `100`.

---

## 🗃 Data Model

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK "globally unique"
        string password_hash
        string first_name
        string last_name
        string avatar_url
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    ORGANIZATIONS {
        int id PK
        string name
        string slug
        datetime created_at
        datetime updated_at
    }

    ORGANIZATION_MEMBERS {
        int organization_id PK, FK
        int user_id PK, FK
        enum role "ADMIN or AGENT"
        datetime joined_at
    }

    CUSTOMERS {
        int id PK
        string email
        string first_name
        string last_name
        string phone
        datetime created_at
        datetime updated_at
    }

    ORGANIZATION_CUSTOMERS {
        int organization_id PK, FK
        int customer_id PK, FK
        datetime created_at
    }

    TEAMS {
        int id PK
        int organization_id FK
        string name
        string description
        datetime created_at
        datetime updated_at
    }

    TEAM_MEMBERS {
        int team_id PK, FK
        int user_id PK, FK
        datetime created_at
    }

    TICKETS {
        int id PK
        int organization_id FK
        int customer_id FK
        int assigned_team_id FK "optional"
        int assigned_agent_id FK "optional"
        string subject
        string description
        enum status
        enum priority
        datetime created_at
        datetime updated_at
        datetime resolved_at
    }

    COMMENTS {
        int id PK
        int ticket_id FK
        int author_user_id FK
        string body
        enum visibility "PUBLIC or INTERNAL"
        datetime created_at
        datetime updated_at
    }

    TICKET_EVENTS {
        int id PK
        int ticket_id FK
        int actor_user_id FK
        enum event_type
        jsonb old_value
        jsonb new_value
        jsonb metadata
        datetime created_at
    }

    USERS ||--o{ ORGANIZATION_MEMBERS : "joins"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "has"
    ORGANIZATIONS ||--o{ ORGANIZATION_CUSTOMERS : "serves"
    CUSTOMERS ||--o{ ORGANIZATION_CUSTOMERS : "contacts"
    ORGANIZATIONS ||--o{ TEAMS : "owns"
    TEAMS ||--o{ TEAM_MEMBERS : "has"
    USERS ||--o{ TEAM_MEMBERS : "belongs to"
    ORGANIZATIONS ||--o{ TICKETS : "scopes"
    CUSTOMERS ||--o{ TICKETS : "opens"
    TEAMS |o--o{ TICKETS : "assigned to"
    USERS |o--o{ TICKETS : "assigned agent"
    TICKETS ||--o{ COMMENTS : "has"
    USERS ||--o{ COMMENTS : "writes"
    TICKETS ||--o{ TICKET_EVENTS : "logs"
    USERS ||--o{ TICKET_EVENTS : "performs"
```

### Key modeling decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Identity** | A single `users` table for admins and agents | One person = one identity, able to hold different roles in different organizations |
| **Membership** | `organization_members` join table with a composite PK `(organization_id, user_id)` | Many-to-many with a per-organization role |
| **Customers vs. users** | Separate `customers` table | Different concept and lifecycle: customers *request* support, users *provide* it |
| **Internal notes** | Same `comments` table, `visibility` = `PUBLIC` \| `INTERNAL` | No duplicated table or logic; one query path with a visibility filter |
| **History** | `ticket_events` with JSONB `old_value` / `new_value` | A flexible audit trail without a table per event type |
| **Ownership** | No `owner_id` on organizations in V1 | Keeps the first version simple; roles already cover permissions |

---

## 🎫 Ticket Lifecycle

```mermaid
stateDiagram-v2
    [*] --> OPEN
    OPEN --> IN_PROGRESS
    IN_PROGRESS --> WAITING_FOR_CUSTOMER
    WAITING_FOR_CUSTOMER --> IN_PROGRESS
    IN_PROGRESS --> RESOLVED
    RESOLVED --> CLOSED
    CLOSED --> [*]
```

**Priorities:** `LOW` · `MEDIUM` · `HIGH` · `URGENT`

### Flexible assignment

A ticket can be routed in four ways:

| Mode | Team | Agent | Example |
|------|:----:|:-----:|---------|
| Unassigned | ∅ | ∅ | Freshly created ticket |
| Team only | ✅ | ∅ | Sent to *Billing* |
| Agent only | ∅ | ✅ | Handled by *Ahmed* |
| Team + Agent | ✅ | ✅ | *Billing* → *Ahmed* |

### Audit trail

Every meaningful change is recorded in `ticket_events`:

`TICKET_CREATED` · `TICKET_ASSIGNED` · `TICKET_UNASSIGNED` · `STATUS_CHANGED` · `PRIORITY_CHANGED` · `TEAM_CHANGED` · `AGENT_CHANGED` · `COMMENT_ADDED` · `ATTACHMENT_ADDED` *(reserved for a future release)*

```text
Ticket created
   ↓
Assigned to Billing
   ↓
Assigned to Ahmed
   ↓
Priority changed: MEDIUM → HIGH
   ↓
Comment added
   ↓
Status changed: OPEN → RESOLVED
```

---

## 🔒 Business Rules & Integrity

Because this is more than a database, the service layer enforces **cross-entity invariants** that foreign keys alone cannot express:

| Rule | Guarantee |
|------|-----------|
| **Ticket ↔ Customer** | The customer must be linked to the **same organization** as the ticket |
| **Ticket ↔ Team** | The assigned team must belong to the **same organization** |
| **Ticket ↔ Agent** | The assigned agent must be a **member of the same organization** |
| **Team ↔ Agent** | An agent can only join a team if they are already a member of that team's organization |
| **Internal notes** | Comments with `INTERNAL` visibility are never exposed to customers |

---

## 🔐 Authentication & Authorization

**Authentication:** email + password login, returning a short-lived **JWT access token** and a **refresh token**.

**Authorization:** role-based, **and always scoped to the organization** in the request context.

| Capability | `ADMIN` | `AGENT` |
|------------|:-------:|:-------:|
| Manage organization | ✅ | ❌ |
| Manage members | ✅ | ❌ |
| Manage teams | ✅ | ❌ |
| View tickets | ✅ | ✅ |
| Update tickets and status | ✅ | ✅ |
| Add comments and internal notes | ✅ | ✅ |
| Assign tickets | ✅ | ⚙️ per configurable permissions |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Framework | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| API style | REST + Swagger / OpenAPI |
| Containerization | Docker |
| Testing | Jest |

---

## 🧭 Design Principles

> **The goal is not to use as many technologies as possible. The goal is to build a real system and learn the right concept when a real problem demands it.**

The project deliberately starts with a **minimal stack** and grows with real requirements, rather than adopting production-grade tooling for its own sake.

| Technology | Adopt when… |
|------------|-------------|
| Redis / BullMQ | There are real background jobs worth processing asynchronously |
| WebSockets | Real-time updates become a genuine requirement |
| Caching | A measurable performance need appears |
| Architecture refactor | A service becomes too large, e.g. `TicketService` growing past ~700 lines |

**Intentionally out of scope for now:** Microservices · Kafka · Kubernetes · Elasticsearch · GraphQL · CQRS · DDD · Event-driven architecture · Redis · BullMQ

Not because they are bad, but because the requirements do not justify them yet.

---

## 🗺 Roadmap

Development follows **vertical slices**: each feature is built end to end, understood, and only then extended.

```mermaid
flowchart LR
    P1["Phase 1<br/>Setup and<br/>template"]:::done
    P2["Phase 2<br/>Users · Orgs<br/>Members"]:::next
    P3["Phase 3<br/>Auth · JWT<br/>Guards · Roles"]
    P4["Phase 4<br/>Customers<br/>Teams"]
    P5["Phase 5<br/>Tickets<br/>Assignment"]
    P6["Phase 6<br/>Comments<br/>Events"]
    P7["Phase 7<br/>AuthZ and<br/>Tenancy"]
    P8["Phase 8<br/>Tests · Errors<br/>Transactions"]
    P9["Phase 9+<br/>Advanced"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8 --> P9

    classDef done fill:#2da44e,color:#ffffff,stroke:#2da44e
    classDef next fill:#bf8700,color:#ffffff,stroke:#bf8700
```

| Phase | Focus | Status |
|:-----:|-------|:------:|
| **1** | Project setup, understanding the NestJS + Prisma template | ✅ Done |
| **2** | Users, Organizations, Organization Members | 🔜 Next |
| **3** | Authentication: JWT, Refresh Tokens, Guards, Roles | ⏳ Planned |
| **4** | Customers, Teams, Team Members | ⏳ Planned |
| **5** | Tickets: Assignment, Status, Priority | ⏳ Planned |
| **6** | Comments, Internal Notes, Ticket Events | ⏳ Planned |
| **7** | Authorization, multi-tenancy enforcement, business rules | ⏳ Planned |
| **8** | Testing, error handling, transactions, API refinement | ⏳ Planned |
| **9+** | Advanced features (below) | 💡 Future |

### 🔮 Beyond V1

```mermaid
mindmap
  root((Post-V1))
    Attachments
      File uploads on tickets
    Notifications
      In-app
      Email
    Real-time
      WebSocket updates
    Email-to-Ticket
      Parsing and threading
      Spam and duplicate handling
    Custom Fields
      Order number
      Product
      Refund amount
    Search and Filtering
      Status
      Priority
      Team
      Agent
    Analytics
      Tickets opened and resolved
      Avg. resolution time
      Agent performance
    Background Jobs
      Redis
      BullMQ
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS) and **npm**
- **Docker** (for PostgreSQL), or a local PostgreSQL instance

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Omar-Fetooh/multi-tenant-helpdesk.git
cd multi-tenant-helpdesk

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
docker run --name helpdesk-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=helpdesk \
  -p 5432:5432 -d postgres:16

# 4. Configure environment (create a .env file)
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk"' > .env

# 5. Apply database migrations
npx prisma migrate dev

# 6. Run the app in watch mode
npm run start:dev
```

Once running, the interactive API documentation is available through **Swagger UI** at `http://localhost:3000/api`.

### Tests

```bash
npm run test          # unit tests
npm run test:e2e      # end-to-end tests
```

---

## 🙏 Acknowledgements

Built on top of the official Prisma example
[`prisma/blog-backend-rest-api-nestjs-prisma`](https://github.com/prisma/blog-backend-rest-api-nestjs-prisma), used as a minimal starting point and progressively transformed into a Helpdesk API.

---

## 👤 Author

**Omar Fetooh**, Full-Stack Software Engineer (TypeScript · React · Next.js · Node.js · PostgreSQL)

[LinkedIn](https://www.linkedin.com/in/omar-fetooh-05457120b/) •
[GitHub](https://github.com/Omar-Fetooh) •
[Portfolio](https://omarfetooh62.getportify.com/) •
[Email](mailto:omarfetooh62@gmail.com)

---

## 📄 License

This project is proprietary software. All rights reserved. 
See the [LICENSE](LICENSE) file for terms and conditions.

<div align="center">

⭐ *If you find this project interesting, feel free to star the repo!*

</div>