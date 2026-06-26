# ADR-005: Use Supabase as the Unified Data Layer

Status: Accepted
Date: 2026-06-30

## Context

Insurer Rights requires multiple data capabilities:

- User authentication
- Relational data storage
- Vector storage
- Document metadata storage
- Chat history persistence
- File storage
- Access control

Several architectural approaches were considered.

A common production architecture separates these concerns across
multiple services:

- Authentication provider
- PostgreSQL database
- Object storage service
- Vector database
- User management system

While this provides flexibility and independent scaling, it also
introduces additional infrastructure complexity, operational overhead, and deployment requirements.

The project is being developed by a one person with a focus on rapid
iteration and deployment simplicity.

---

## Decision

Use Supabase as the primary data platform for the application.

Supabase provides:

- Authentication (Supabase Auth)
- PostgreSQL database
- pgvector extension
- File storage
- Row-level security capabilities
- Managed infrastructure

The backend interacts directly with Supabase for all persistent data
operations.

Architecture:

```text
                Supabase
                     │
 ┌───────────────────┼───────────────────┐
 │                   │                   │
Auth           PostgreSQL          Storage
 │                   │                   │
Users      Documents/Chats      PDF Files
                    │
                pgvector
                    │
              Embeddings
```

All application data remains within a single managed platform.

---

## Alternatives Considered

### Multi-Service Architecture

Example:

```text
Auth0
PostgreSQL
AWS S3
Pinecone
```

#### Pros

- Independent scaling
- Best-in-class services
- Greater flexibility

#### Cons

- More infrastructure to manage
- Additional credentials and secrets
- Higher operational complexity
- Increased deployment overhead
- Potential future costs

**Decision:** Rejected

---

### Self-Hosted Components

Example:

```text
Keycloak
PostgreSQL
MinIO
Chroma
```

#### Pros

- Full control
- No vendor dependency

#### Cons

- Infrastructure maintenance burden
- Monitoring requirements
- Backup responsibility
- Higher operational complexity

**Decision:** Rejected

---

### Unified Supabase Data Layer

#### Pros

- Single platform for all core data needs
- Faster development
- Simpler deployment
- Reduced operational overhead
- Built-in integration between services
- Lower infrastructure complexity

#### Cons

- Greater dependence on a single provider
- Less flexibility for independent scaling
- Future migration may require additional effort

**Decision:** Accepted

---

## Consequences

### Positive

- Simplified architecture.
- Faster development and deployment.
- Reduced infrastructure management.
- Fewer secrets and configuration requirements.
- Consistent security model across services.
- Lower operational burden.

### Negative

- Increased vendor dependency on Supabase.
- Potential migration effort if requirements outgrow the platform.
- Some services cannot be scaled independently.

---

## Rationale

The project's primary constraint is development velocity rather than
infrastructure scale.

Using Supabase as the unified data layer eliminates the need to manage multiple external systems while still providing all required
capabilities through a single platform.

The benefits of reduced complexity, faster development, and simplified deployment outweigh the risks of vendor concentration at the current stage of the project.

The architecture therefore prioritizes operational simplicity and rapid delivery over infrastructure flexibility.

---

## Related ADRs

- ADR-001: Use pgvector as the Vector Store
- ADR-003: JWT Authentication via FastAPI Dependency Injection
- ADR-004: Feature-Based Modular FastAPI Architecture
