# ADR-010: Category-Level Reasoning over Literal Term Matching

Status: Accepted
Date: 2026-06-19

## Context

Insurer Rights helps users understand insurance policies using
Retrieval-Augmented Generation (RAG).

Early retrieval behavior relied heavily on literal term matching and
semantic similarity between the user's question and policy text.

This approach worked well when the language used by the user closely
matched the language used in the policy document.

Example:

User:

```text
What is the waiting period for pre-existing diseases?
```

Policy:

```text
A waiting period of 36 months applies to pre-existing diseases.
```

The system successfully retrieved the relevant clause.

However, problems emerged when users described concepts using common
language rather than policy terminology.

Example:

User:

```text
What is the waiting period for diabetes?
```

Policy:

```text
I am sorry. I could not find this.
```

Although diabetes is commonly treated as a pre-existing disease, the
policy may never explicitly mention the word "diabetes."

A retrieval strategy based primarily on literal matching would fail to connect the user's intent to the relevant policy clause.

This behavior produced answers that were technically grounded but often failed to meet user expectations.

---

## Decision

Adopt category-level reasoning as part of the retrieval and answer
generation process.

The system is allowed to make reasonable domain-level associations
between specific terms and broader insurance categories.

Examples:

```text
Diabetes
    ↓
Pre-existing Disease
```

```text
Heart Surgery
    ↓
Cardiac Procedures
```

```text
Cancer Treatment
    ↓
Critical Illness Coverage
```

The system may use these conceptual relationships to locate relevant
policy clauses and answer questions.

Retrieved policy content remains the primary source of truth.

Reasoning is used to identify relevant policy sections, not to replace them.

---

## Alternatives Considered

### Literal Term Matching

Assumption:

```text
Only retrieve text containing the same terminology as the question.
```

#### Pros

- Highly deterministic
- Easy to explain
- Minimal reasoning complexity

#### Cons

- Poor handling of natural user language
- Misses relevant policy clauses
- Creates false negatives
- Reduces answer quality

**Decision:** Rejected

---

### Unrestricted LLM Reasoning

Assumption:

```text
Allow the model to answer using inferred knowledge regardless of
retrieved evidence.
```

#### Pros

- Flexible
- High recall

#### Cons

- Increased hallucination risk
- Weaker policy grounding
- Less trustworthy answers

**Decision:** Rejected

---

### Category-Level Reasoning with Policy Grounding

Assumption:

```text
Reason over concepts
        ↓
Retrieve evidence
        ↓
Generate answer
```

#### Pros

- Better alignment with user language
- Improved retrieval relevance
- Preserves policy grounding
- Reduces false negatives
- More natural user experience

#### Cons

- Additional reasoning complexity
- Requires careful prompt design
- Risk of incorrect category associations

**Decision:** Accepted

---

## Consequences

### Positive

- Better understanding of user intent.
- Improved retrieval accuracy.
- More natural interactions.
- Reduced dependence on exact policy terminology.
- Better handling of insurance-specific concepts.

### Negative

- Additional reasoning complexity.
- Requires safeguards against unsupported assumptions.
- Harder to debug than purely literal retrieval.

---

## Rationale

Policyholders rarely use the same terminology that appears in insurance contracts.

Users think in terms of real-world situations and medical conditions, while policies often organize information using broader legal or
insurance categories.

A system that requires exact terminology places the burden of policy
language on the user.

The goal of Insurer Rights is to reduce information asymmetry, not
increase it.

Category-level reasoning allows the platform to bridge the gap between how users ask questions and how insurance policies are written while remaining grounded in retrieved evidence.

The architecture therefore prioritizes conceptual understanding over
literal term matching.

---

## Related ADRs

- ADR-008: Hybrid Retrieval Scope (Policy Documents and Regulatory Knowledge)
- ADR-009: Separation of Policy Knowledge and Insurance Domain Knowledge