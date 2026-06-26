# ADR-004: Feature-Based Modular FastAPI Architecture

Status: Accepted
Date: 2026-06-07

## Context

Insurer Rights is a rapidly evolving AI application that combines:

- Authentication
- PDF ingestion
- Embedding generation
- Vector retrieval
- RAG orchestration
- Chat history management
- Streaming responses

The backend is built with FastAPI and is expected to expand with
additional features including:

- Policy Comparator
- Claim Assistant
- Rejection Analyzer
- Renewal Advisor

Several backend organization approaches were evaluated.

The most common enterprise pattern is a layered architecture:

```text
controllers/
services/
repositories/
models/
```

Under this approach, requests flow through multiple abstraction layers before reaching business logic.

For a small-to-medium AI application, this can introduce additional
complexity and indirection without providing significant benefits.

The project requires fast iteration and clear ownership of features.

---

## Decision

Adopt a feature-based modular FastAPI architecture.

Backend code is organized around business capabilities rather than
technical layers.

Structure:

```text
backend/
├── routers/
│   ├── auth.py
│   ├── dependencies.py
│   └── docs.py
│   ├── globalChat.py
│   └── history.py
│   ├── query.py
│   └── upload.py
│
├── services/
│   ├── embedding_service.py
│   ├── global_chat_service.py
│   ├── pdf_service.py
│   └── rag_service.py
│
├── dependencies.py
├── models/
└── main.py
```

Each router owns a specific feature area and directly coordinates the
required services.

Services contain reusable AI and document-processing logic but do not
introduce repository or domain abstraction layers.

---

## Alternatives Considered

### Traditional Layered Architecture

```text
controllers/
services/
repositories/
models/
```

#### Pros

- Familiar enterprise pattern
- Strong separation of concerns
- Useful for large teams
- Easier database abstraction

#### Cons

- Additional boilerplate
- More files for simple workflows
- Increased cognitive overhead
- Slower feature development
- Premature abstraction for current scale

**Decision:** Rejected

---

### Monolithic FastAPI File

```text
main.py
```

#### Pros

- Fastest initial development
- Minimal structure

#### Cons

- Poor maintainability
- Difficult to scale
- Harder testing
- Feature boundaries unclear

**Decision:** Rejected

---

### Feature-Based Modular Architecture

#### Pros

- Clear ownership of functionality
- Fast iteration speed
- Easy onboarding
- Scales naturally as features grow
- Minimal boilerplate
- Matches FastAPI router design

#### Cons

- Less rigid separation than enterprise layered systems
- May require restructuring at very large scale

**Decision:** Accepted

---

## Consequences

### Positive

- Faster feature development.
- Clear separation between business capabilities.
- Easier navigation of the codebase.
- Lower architectural complexity.
- Aligns naturally with FastAPI routers.
- Supports rapid experimentation during product development.

### Negative

- Business logic may be distributed across feature modules.
- Future large-scale growth may require additional abstraction layers.
- Less suitable for very large engineering teams.

---

## Rationale

Insurer Rights is currently a single-product application maintained by only one person.

The primary goal is to maximize development velocity while maintaining reasonable code organization.

A traditional layered architecture would introduce additional
abstractions without solving a current problem.

Feature-based modularity provides a balance between maintainability and development speed while remaining flexible enough for future growth.

The architecture therefore prioritizes simplicity, clarity, and rapid
iteration over enterprise-scale abstraction.

---

## Related ADRs

- ADR-001: Use pgvector as the Vector Store
- ADR-002: Hybrid PDF Extraction Using PyMuPDF and pdfplumber
- ADR-003: JWT Authentication via FastAPI Dependency Injection