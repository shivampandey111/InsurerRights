# ADR-001: Use pgvector as the Vector Store

Status: Accepted  
Date: 2026-05-30

## Context

Insurer Rights requires semantic search over insurance policy documents and regulatory reference documents to power its Retrieval-Augmented Generation (RAG) pipeline.

The system must store document embeddings persistently and support similarity search with metadata filtering. The project is deployed using:

- FastAPI (Backend)
- Supabase PostgreSQL (Database)
- Render (Backend Hosting)

Several vector storage options were evaluated:

- ChromaDB
- Pinecone
- Supabase pgvector

A key infrastructure constraint is that Render's free tier uses an ephemeral filesystem. Any vector database that stores embeddings on local disk risks data loss whenever the application is redeployed, restarted, or moved to a new instance.

Additionally, the project already relies on Supabase for authentication and application data storage. Introducing another infrastructure service would increase operational complexity without providing significant benefits at the current scale.

---

## Decision

Use the pgvector extension within the existing Supabase PostgreSQL instance as the primary vector store.

Document embeddings will be stored in the `document_chunks` table using the `vector` data type and queried through PostgreSQL similarity search functions.

All application data, including:

- Users
- Documents
- Chat history
- Vector embeddings

will remain within a single managed PostgreSQL environment.

---

## Alternatives Considered

### ChromaDB

#### Pros

- Simple setup
- Popular choice for RAG projects
- Good LangChain integration
- Fast local development experience

#### Cons

- Persists vectors on the application filesystem
- Incompatible with Render's ephemeral storage model
- Embeddings would be lost after redeployments or instance restarts
- Would require reprocessing all uploaded documents

**Decision:** Rejected

---

### Pinecone

#### Pros

- Fully managed vector database
- Highly scalable
- Optimized similarity search performance
- Production-ready infrastructure

#### Cons

- Additional external service to manage
- Additional credentials and configuration
- Additional operational complexity
- Potential future costs

**Decision:** Rejected, would be considered for future scaling.

---

### Supabase pgvector

#### Pros

- Persistent storage
- Already available within existing infrastructure
- No additional service required
- Supports metadata filtering through SQL
- Simplifies deployment and maintenance
- Keeps all application data in one system

#### Cons

- Not as specialized as dedicated vector databases
- May require indexing and optimization at larger scale
- Vector and transactional workloads share the same database

**Decision:** Accepted

---

## Consequences

### Positive

- Embeddings persist across deployments and server restarts.
- No additional infrastructure needs to be provisioned or maintained.
- Simpler architecture and deployment process.
- Easier metadata filtering using standard SQL queries.
- Lower operational overhead.
- Single source of truth for all application data.

### Negative

- Future scaling may require database tuning or migration to a dedicated vector database.
- Query performance may be lower than specialized vector databases at very large scale.
- Vector search and application workloads share database resources.

---

## Rationale

The primary requirement for the project is reliable persistence of embeddings while maintaining a simple deployment architecture.

Although dedicated vector databases provide stronger scaling characteristics, the project's expected workload does not justify the additional infrastructure complexity.

pgvector satisfies all current functional requirements while leveraging the existing Supabase PostgreSQL instance already used by the application.

The decision prioritizes operational simplicity, persistence, and reduced infrastructure footprint over premature optimization.

---

## Related ADRs

- ADR-002: Hybrid PDF Extraction Using PyMuPDF and pdfplumber
- ADR-003: JWT Authentication via FastAPI Dependency Injection