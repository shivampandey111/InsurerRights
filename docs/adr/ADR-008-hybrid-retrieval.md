# ADR-008: Hybrid Retrieval Scope (Policy Documents and Regulatory Knowledge)

Status: Accepted
Date: 2026-06-01

## Context

Insurer Rights was designed to reduce information asymmetry between
insurance companies and policyholders.

To achieve this objective, the platform must answer two distinct but
related categories of questions.

### Policy-Specific Questions

These questions require knowledge of an individual user's insurance
policy.

Examples:

- What is my room rent limit?
- Does my policy cover cataract surgery?
- What waiting period applies to this condition?
- What exclusions exist for this treatment?

The answers to these questions exist only within the user's uploaded
policy documents.

### Insurance and Regulatory Questions

These questions require broader industry and regulatory knowledge.

Examples:

- What rights does IRDAI provide to policyholders?
- Can an insurer reject a claim for this reason?
- What is a deductible?
- How do waiting periods work in health insurance?

The answers to these questions may not exist within a specific policy
document and instead depend on regulatory guidance, consumer protection rules, and insurance domain knowledge.

Neither knowledge source is sufficient on its own.

User policies provide personalized coverage information but lack
broader regulatory context.

Regulatory documents provide authoritative insurance knowledge but
cannot answer questions about a user's specific coverage, exclusions,
limits, or benefits.

The platform therefore requires access to both personalized policy
knowledge and authoritative insurance reference material.

---

## Decision

Adopt a hybrid retrieval architecture consisting of:

1. User Policy Documents
2. Global Regulatory and Insurance Knowledge Documents

User policy documents are private and isolated by user identity.

Global reference documents are shared across the platform and include:

- IRDAI regulations
- Consumer protection guidelines
- Insurance reference documents
- Domain knowledge resources

Both knowledge sources are stored within the vector store and are
available to the retrieval system.

Retrieval architecture:

```text
Question
    ↓

 ┌────────────────────┐
 │ User Policy Chunks │
 └────────────────────┘

          +

 ┌────────────────────┐
 │ Global Knowledge   │
 │ Documents          │
 └────────────────────┘

          ↓

 Combined Retrieval Context

          ↓

      Answer
```

The retrieval layer determines which documents are relevant to the
question rather than treating policy knowledge and regulatory knowledge
as separate systems.

---

## Alternatives Considered

### User Policy Documents Only

#### Pros

- Simpler retrieval architecture
- Strong grounding in uploaded documents
- Easier implementation

#### Cons

- Cannot answer broader insurance questions
- Limited educational value
- Cannot provide regulatory context
- Reduces usefulness for users without relevant policy information

**Decision:** Rejected

---

### Regulatory Knowledge Only

#### Pros

- Strong insurance education capabilities
- Broad domain coverage

#### Cons

- Cannot answer policy-specific questions
- No personalization
- Ignores uploaded user documents

**Decision:** Rejected

---

### Separate Retrieval Systems

Example:

```text
Policy Questions
       ↓
Policy Retriever

Insurance Questions
       ↓
Regulatory Retriever
```

#### Pros

- Clear separation of responsibilities
- Independent optimization

#### Cons

- Additional routing complexity
- Requires question classification
- Increased maintenance burden
- More difficult to support mixed queries

**Decision:** Rejected

---

### Hybrid Retrieval Scope

#### Pros

- Supports both personalized and general questions
- Enables richer answers
- Reduces information silos
- Aligns with real user behavior
- Simplifies the user experience

#### Cons

- Increased retrieval complexity
- Additional reference document maintenance
- Requires retrieval tuning to balance sources

**Decision:** Accepted

---

## Consequences

### Positive

- Users can receive both policy-specific and regulatory guidance.
- Supports educational and analytical use cases.
- Improves answer completeness.
- Enables consumer-rights and compliance discussions.
- Creates a more useful insurance assistant.
- Reduces dependence on a single knowledge source.

### Negative

- Additional ingestion and maintenance of reference documents.
- More complex retrieval strategy.
- Greater responsibility to keep regulatory knowledge current.

---

## Rationale

The platform was intentionally designed to function as both:

- A policy interpretation assistant
- An insurance knowledge assistant

These responsibilities require different but complementary knowledge
sources.

Policy documents explain what coverage exists for a specific user.

Regulatory and insurance reference documents provide the broader
industry context necessary to understand rights, obligations, and
insurance concepts.

Combining both sources allows the platform to answer questions that are personalized, educational, and contextually complete.

The architecture therefore treats policy knowledge and regulatory
knowledge as complementary components of a unified retrieval system
rather than independent capabilities.

---

## Related ADRs

- ADR-006: Dual Conversation Modes (Document Chat and Global Chat)
- ADR-007: Insurance-Aware Chunking Strategy
- ADR-009: Separation of Policy Knowledge and Insurance Knowledge
- ADR-010: Category-Level Reasoning over Literal Term Matching
