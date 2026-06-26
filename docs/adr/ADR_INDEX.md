# Architecture Decision Records

This directory contains architectural decisions made during the development of Insurer Rights.

Architectural Decision Records (ADRs) capture the reasoning behind major technical, product, and system design choices.

---

## Accepted ADRs

| ADR | Title | Status | Category |
|------|---------|---------|---------|
| ADR-001 | Use pgvector as the Vector Store | Accepted | Infrastructure |
| ADR-002 | Hybrid PDF Extraction Using PyMuPDF and pdfplumber | Accepted | Data Ingestion |
| ADR-003 | JWT Authentication via FastAPI Dependency Injection | Accepted | Security |
| ADR-004 | Feature-Based Modular FastAPI Architecture | Accepted | Backend Architecture |
| ADR-005 | Use Supabase as the Unified Data Layer | Accepted | Infrastructure |
| ADR-006 | Dual Conversation Modes (Document Chat and Global Chat) | Accepted | Product Architecture |
| ADR-007 | Insurance-Aware Chunking Strategy | Accepted | Retrieval Architecture |
| ADR-008 | Hybrid Retrieval Scope (Policy Documents and Regulatory Knowledge) | Accepted | Knowledge Architecture |
| ADR-009 | Separation of Policy Knowledge and Insurance Domain Knowledge | Accepted | Knowledge Architecture |
| ADR-010 | Category-Level Reasoning over Literal Term Matching | Accepted | AI Reasoning |
| ADR-011 | Use Server-Sent Events (SSE) for Response Streaming | Accepted | Communication Architecture |
| ADR-012 | Buffered SSE Parsing for Reliable Token Streaming | Accepted | Reliability Architecture |

---

## ADR Lifecycle

Possible statuses:

- Proposed
- Accepted
- Superseded
- Deprecated

All ADRs in this repository are currently Accepted.