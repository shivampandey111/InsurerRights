# ADR-009: Separation of Policy Knowledge and Insurance Domain Knowledge

Status: Accepted
Date: 2026-06-20

## Context

Insurer Rights provides users with answers about insurance policies,
claims, coverage, exclusions, and insurance concepts.

During system design, it became clear that not all user questions are
answered by policy documents alone.

Users frequently ask questions such as:

- What is a deductible?
- What is co-payment?
- What is cashless hospitalization?
- What is a waiting period?
- How does claim settlement work?
- What is a pre-existing disease?

These questions represent insurance domain knowledge rather than
policy-specific knowledge.

A policy document typically describes how a particular insurer applies these concepts but does not necessarily define or explain them.

For example:

A policy may contain:

```text
A 36-month waiting period applies to pre-existing diseases.
```

However, the document may never explain:

- What a waiting period is
- Why waiting periods exist
- How waiting periods are regulated

Similarly, a policy may mention:

```text
10% co-payment applies.
```

without defining co-payment itself.

Treating policy documents as the sole source of truth would therefore
prevent the system from answering many legitimate user questions.

The platform requires a clear distinction between:

1. Policy Knowledge
2. Insurance Domain Knowledge

---

## Decision

Separate knowledge into two conceptual layers.

### Policy Knowledge

Information specific to a user's uploaded document.

Examples:

- Coverage limits
- Waiting period duration
- Exclusions
- Sum insured
- Room rent caps
- Co-payment percentages

Source:

- User policy documents

### Insurance Domain Knowledge

General insurance concepts, terminology, processes, and regulations.

Examples:

- What is co-payment?
- What is a deductible?
- What is claim settlement?
- What are policyholder rights?
- How do waiting periods work?

Sources:

- Regulatory documents
- Insurance reference material
- Model knowledge
- Global knowledge documents

The system treats these as distinct knowledge categories and does not
assume that policy documents contain sufficient information to answer
insurance education questions.

---

## Alternatives Considered

### Policy-Centric Knowledge Model

Assumption:

```text
All answers must come from policy documents.
```

#### Pros

- Simple architecture
- Strong document grounding

#### Cons

- Cannot explain insurance concepts
- Poor educational experience
- Fails when documents omit definitions
- Reduces usefulness of Global Chat

**Decision:** Rejected

---

### Domain-Knowledge-Only Model

Assumption:

```text
General insurance knowledge is sufficient.
```

#### Pros

- Broad educational capability
- Simpler knowledge management

#### Cons

- Cannot answer policy-specific questions
- Ignores user documents
- Loses personalization

**Decision:** Rejected

---

### Dual Knowledge Model

Assumption:

```text
Policy Knowledge
        +
Insurance Domain Knowledge
```

#### Pros

- Supports both education and analysis
- More closely matches user needs
- Enables richer explanations
- Preserves document grounding
- Supports Global Chat and Document Chat

#### Cons

- Additional retrieval complexity
- Requires reasoning across multiple knowledge sources

**Decision:** Accepted

---

## Consequences

### Positive

- Users can learn insurance concepts without uploading documents.
- Policy interpretation becomes easier because concepts can be explained.
- Answers become more educational and complete.
- Supports both novice and experienced users.
- Enables future insurance-assistant capabilities.

### Negative

- Additional complexity in retrieval and prompting.
- Requires distinguishing between concept questions and policy questions.
- Increases dependence on high-quality domain knowledge sources.

---

## Rationale

The mission of Insurer Rights is not merely to retrieve policy text.

The platform exists to reduce information asymmetry between insurers and policyholders.

Achieving this goal requires helping users understand both:

- What their policy says
- What insurance concepts mean

A user who sees "10% co-payment" in a policy gains little value if they do not understand what co-payment means.

By explicitly separating policy knowledge from insurance domain
knowledge, the platform can explain concepts, interpret policy language, and provide more useful guidance.

The architecture therefore treats policy interpretation and insurance
education as complementary responsibilities rather than a single
retrieval problem.

---

## Related ADRs

- ADR-006: Dual Conversation Modes (Document Chat and Global Chat)
- ADR-008: Hybrid Retrieval Scope (Policy Documents and Regulatory Knowledge)
- ADR-010: Category-Level Reasoning over Literal Term Matching