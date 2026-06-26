# ADR-006: Dual Conversation Modes (Document Chat and Global Chat)

Status: Accepted
Date: 2026-06-18

## Context

Insurer Rights was initially designed as a document-centric Retrieval
Augmented Generation (RAG) platform.

The original interaction model assumed that every user question would be associated with an uploaded insurance policy document:

```text
User
 ↓
Upload Policy
 ↓
Ask Question
 ↓
Retrieve Chunks
 ↓
Generate Answer
```

During testing, it became clear that many user questions were not tied to a specific policy document.

Examples include:

- What is a deductible?
- What is co-payment in health insurance?
- What is cashless hospitalization?
- What is the role of IRDAI?
- How does claim settlement work?
- Which insurance policy is suitable for senior citizens?

These questions require insurance domain knowledge rather than policy-specific retrieval.

Requiring users to upload a document before receiving value from the
platform introduced unnecessary friction and created a poor onboarding experience.

The platform therefore needed a mechanism to support both document-
specific assistance and general insurance guidance.

---

## Decision

Adopt a dual conversation architecture consisting of:

### Document Chat

Used when a user selects or uploads a specific policy document.

The system performs Retrieval-Augmented Generation (RAG) using:

- User policy documents
- Global regulatory documents
- Conversation history

Architecture:

```text
Question
    ↓
Retrieve Relevant Chunks
    ↓
Generate Answer
```

### Global Chat

Used when no document is selected.

The system acts as an insurance knowledge assistant and answers
questions using:

- Insurance domain knowledge
- Regulatory reference knowledge
- Model reasoning capabilities

Architecture:

```text
Question
    ↓
Insurance Knowledge
    ↓
Generate Answer
```

Users can receive value from the platform without uploading a document.

---

## Alternatives Considered

### Document-Only Experience

#### Pros

- Simpler architecture
- Single query path
- Easier retrieval logic

#### Cons

- Forces document upload before interaction
- Poor user onboarding experience
- Cannot answer general insurance questions
- Reduces platform usefulness
- Creates unnecessary user friction

**Decision:** Rejected

---

### Global Chat Only

#### Pros

- Simplest user experience
- No document dependency

#### Cons

- Cannot provide policy-specific answers
- Loses personalization
- Eliminates core RAG capabilities
- Weakens the primary value proposition

**Decision:** Rejected

---

### Dual Conversation Modes

#### Pros

- Supports both educational and document-specific use cases
- Reduces onboarding friction
- Provides immediate value to new users
- Preserves document intelligence capabilities
- Aligns with real user behavior

#### Cons

- Additional application complexity
- Multiple query paths must be maintained
- Requires clear UI distinction between modes

**Decision:** Accepted

---

## Consequences

### Positive

- Users can interact with the platform immediately.
- Document upload is no longer a prerequisite for engagement.
- Supports both insurance education and policy analysis.
- Improves user onboarding and retention.
- Expands platform usefulness beyond uploaded documents.
- Creates a more natural conversational experience.

### Negative

- Additional architectural complexity.
- Multiple conversation flows must be maintained.
- Increased testing requirements.
- User interface must clearly communicate active mode.

---

## Rationale

The platform's mission is to reduce information asymmetry in the
insurance industry.

Many insurance questions are educational rather than document-specific.

Restricting all interactions to uploaded documents would prevent users
from obtaining value until they completed the ingestion workflow.

A dual conversation model allows users to:

- Learn about insurance concepts before purchasing a policy.
- Understand industry terminology.
- Ask regulatory and claim-related questions.
- Analyze specific policy documents when available.

The architecture therefore prioritizes user accessibility and product
utility while preserving the benefits of Retrieval-Augmented Generation.

---

## Related ADRs

- ADR-007: Insurance-Aware Chunking Strategy
- ADR-008: Hybrid Retrieval Scope (Policy and Regulatory Knowledge)
- ADR-009: Separation of Policy Knowledge and Insurance Knowledge
- ADR-011: Fallback-to-Knowledge Response Strategy