# ADR-007: Insurance-Aware Chunking Strategy

Status: Accepted
Date: 2026-06-01

## Context

Insurer Rights relies on Retrieval-Augmented Generation (RAG) to answer questions about insurance policies.

The quality of retrieval is heavily dependent on how documents are
segmented before embedding.

A naïve chunking strategy based solely on fixed character counts was
initially considered.

Example:

```text
Chunk 1:
...waiting period for pre-existing diseases is...

Chunk 2:
...36 months from policy inception...
```

In this scenario, critical policy information becomes fragmented across multiple chunks.

Insurance policies are highly structured documents containing:

- Sections
- Clauses
- Definitions
- Exclusions
- Coverage schedules
- Waiting periods
- Benefit tables
- Sub-limit tables

Users typically ask questions about complete concepts rather than
arbitrary portions of text.

Examples:

- What is the waiting period?
- Is room rent covered?
- Does the policy cover heart surgery?
- What exclusions apply?

Retrieval quality therefore depends on preserving semantic boundaries
rather than splitting content at arbitrary character positions.

---

## Decision

Adopt an insurance-aware chunking strategy using
RecursiveCharacterTextSplitter with custom separators designed around
insurance document structure.

Chunking prioritizes natural document boundaries before falling back to size-based splitting.

Separator hierarchy:

```text
Section boundaries
↓
Clause boundaries
↓
Paragraph boundaries
↓
Sentence boundaries
↓
Character limits
```

Configuration:

```python
chunk_size = 800
chunk_overlap = 200
```

Tables extracted through pdfplumber are preserved as standalone chunks and are not merged into surrounding narrative text.

The objective is to keep related policy information together whenever
possible while remaining within embedding model limits.

---

## Alternatives Considered

### Fixed-Size Chunking

#### Pros

- Simple implementation
- Predictable chunk counts
- Fast processing

#### Cons

- Splits policy clauses arbitrarily
- Breaks semantic relationships
- Reduces retrieval accuracy
- Increases risk of incomplete answers

**Decision:** Rejected

---

### Large Whole-Section Chunks

#### Pros

- Preserves context
- Fewer chunks

#### Cons

- Larger embedding costs
- Lower retrieval precision
- Increased token consumption
- More irrelevant context returned

**Decision:** Rejected

---

### Insurance-Aware Recursive Chunking

#### Pros

- Preserves semantic meaning
- Better retrieval relevance
- Better answer quality
- Aligns with policy document structure
- Works well with both text and tables

#### Cons

- More complex configuration
- Requires domain-specific tuning
- Produces more chunks than large-section approaches

**Decision:** Accepted

---

## Consequences

### Positive

- Improved retrieval accuracy.
- Better preservation of policy context.
- Reduced clause fragmentation.
- Higher answer quality.
- Better handling of insurance-specific document structures.
- Improved semantic search performance.

### Negative

- Additional tuning effort required.
- Chunking logic becomes domain-specific.
- More complex ingestion pipeline.

---

## Rationale

Users do not think in terms of document pages, paragraphs, or character counts.

They ask questions about policy concepts such as coverage limits,
waiting periods, exclusions, and benefits.

A retrieval system should therefore preserve these concepts as complete units whenever possible.

Insurance-aware chunking improves retrieval quality by aligning document segmentation with how insurance information is organized and how users naturally ask questions.

The architecture prioritizes retrieval accuracy and answer quality over simpler chunk generation strategies.

---

## Related ADRs

- ADR-002: Hybrid PDF Extraction Using PyMuPDF and pdfplumber
- ADR-006: Dual Conversation Modes (Document Chat and Global Chat)
- ADR-008: Hybrid Retrieval Scope (Policy and Regulatory Knowledge)