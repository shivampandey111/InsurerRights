# ADR-002: Hybrid PDF Extraction Using PyMuPDF and pdfplumber

Status: Accepted
Date: 2026-06-04

## Context

Insurer Rights uses insurance policy documents as the primary knowledge source for its Retrieval-Augmented Generation (RAG) pipeline.

Document quality directly impacts retrieval quality and, consequently, the accuracy of generated answers.

During the design of the ingestion pipeline, representative insurance documents were reviewed to understand the structure of information that would be processed by the system.

Analysis revealed that critical policy information frequently appears in complex tabular formats, including:

- Coverage schedules
- Room rent limits
- ICU sub-limits
- Waiting periods
- Premium tables
- Benefit schedules

A single extraction strategy optimized for narrative text would risk losing the relationships between headers, rows, and values that are essential for accurate retrieval and reasoning.

Example:

| Benefit | Limit |
|----------|----------|
| Room Rent | ₹3000/day |
| ICU | ₹6000/day |

could be extracted as:

Room Rent

₹3000/day

ICU

₹6000/day

If extracted as flat text, the semantic relationship between the benefit and its associated limit can be weakened or lost.

The ingestion architecture therefore required a strategy capable of handling both narrative policy text and structured tabular data.

---

## Decision

Adopt a hybrid PDF extraction strategy.

### PyMuPDF

Used for:

- Body text
- Clauses
- Definitions
- Exclusions
- General policy wording

### pdfplumber

Used for:

- Coverage tables
- Benefit schedules
- Waiting period tables
- Premium tables
- Sub-limit tables

Extracted tables are transformed into structured text representations before chunking.

Example:

```text
[TABLE]

Benefit: Room Rent
Limit: ₹3000/day

Benefit: ICU
Limit: ₹6000/day
```

Table content is preserved as independent chunks rather than merged into
surrounding text.

---

## Alternatives Considered

### PyMuPDF Only

#### Pros

- Fast extraction
- Simple implementation
- Fewer dependencies
- Lower ingestion time

#### Cons

- Table structure lost
- Lower retrieval quality
- Increased ambiguity during question answering
- Poor handling of insurance-specific document formats

**Decision:** Rejected

---

### pdfplumber Only

#### Pros

- Better table extraction
- Structured output
- Preserves row-column relationships

#### Cons

- Slower extraction
- Less reliable for general text extraction
- More complex handling of narrative content

**Decision:** Rejected

---

### OCR-Based Extraction

#### Pros

- Supports scanned documents
- Can process image-based PDFs

#### Cons

- Additional infrastructure requirements
- Increased processing time
- Higher implementation complexity
- Additional operational costs
- Not required for MVP document set

**Decision:** Rejected

---

## Consequences

### Positive

- Preserves critical policy information contained in tables.
- Improves retrieval accuracy.
- Improves answer quality.
- Reduces ambiguity during policy interpretation.
- Better handling of insurance-specific document structures.
- Maintains strong extraction performance for narrative text.

### Negative

- Slightly slower ingestion pipeline.
- Additional dependency maintenance.
- More complex extraction workflow.
- Higher implementation complexity than a single-library approach.

---

## Rationale

Insurance policies are highly structured documents where important
information is frequently expressed through tables rather than narrative
text.

Retrieval quality depends on preserving the relationship between policy terms and their associated values. Losing table structure during extraction significantly reduces the usefulness of retrieved context.

The additional ingestion cost is acceptable because document processing occurs once during upload, whereas retrieval and question-answering occur throughout the document's lifetime.

The system therefore prioritizes extraction quality and retrieval
accuracy over ingestion speed.

---

## Related ADRs

- ADR-001: Use pgvector as the Vector Store
- ADR-003: JWT Authentication via FastAPI Dependency Injection
- ADR-005: Insurance-Aware Chunking Strategy