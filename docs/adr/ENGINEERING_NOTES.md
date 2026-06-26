# Engineering Decisions Log

This document captures implementation discoveries, experiments, debugging notes, and operational decisions made during the development of Insurer Rights.

Major architectural decisions are documented separately in the ADRs.

---

# Authentication

## Removed Custom Profile Table

Initial design considered maintaining a separate profile table to track application users.

After further investigation, Supabase Authentication already provides user existence checks and user identity management through JWT tokens and the `auth.users` system.

Outcome:

* Removed unnecessary profile table.
* Reduced schema complexity.
* Avoided duplication of user identity data.

---

## JWT Dependency Injection Pattern

Learned and adopted FastAPI dependency injection for authentication.

Pattern:

* Frontend sends JWT access token in Authorization header.
* FastAPI extracts token through a dependency.
* Supabase validates token.
* `response.user` is returned.
* `user.id` becomes the authenticated user identifier.

Result:

* User identity is never passed from the frontend.
* User isolation is automatic.
* Protected endpoints remain clean and reusable.

See ADR-003.

---

# PDF Extraction

## PyMuPDF Limitation Discovery

Initial implementation relied exclusively on PyMuPDF.

Testing against real insurance documents revealed a problem:

* Narrative text extracted correctly.
* Complex tables lost structure.
* Coverage limits, room rent restrictions, waiting periods, and benefit schedules became difficult to interpret.

Result:

PyMuPDF alone was insufficient for insurance documents.

---

## Hybrid Extraction Approach

Added pdfplumber as a second extraction layer.

Final approach:

* PyMuPDF → body text.
* pdfplumber → structured tables.

Outcome:

* Better preservation of insurance-specific information.
* Improved retrieval quality.
* Improved answer accuracy.

See ADR-002.

---

# Embedding Pipeline

## Mother Document Stress Test

Uploaded a regulatory reference document of approximately 12 MB.

Results:

* ~1704 chunks generated.
* 86 embedding requests required.
* Ingestion time increased significantly.

Observation:

Large documents stress the embedding pipeline much more than PDF extraction itself.

---

## Gemini Rate Limit Investigation

Large document ingestion triggered rate-limit concerns.

Temporary configuration:

* Batch size: 5
* Sleep interval: 3 seconds

Result:

* Stable embedding generation.
* No rate-limit failures observed.

After validation:

* Batch size increased.
* Sleep interval reduced.

Lesson:

Embedding throughput requires balancing performance against API reliability.

---

# Streaming Layer

## SSE Streaming Debugging

Initial frontend implementation assumed that network chunks matched SSE event boundaries.

This assumption proved incorrect.

Example:

A single JSON payload could arrive split across multiple network chunks.

Result:

* JSON parse failures.
* Missing streamed tokens.
* Incomplete responses.

---

## Buffered SSE Parser

Implemented a buffered parsing strategy.

Approach:

* Accumulate incoming data.
* Parse only complete SSE events.
* Retain incomplete fragments until additional data arrives.

Outcome:

* Reliable token streaming.
* Elimination of fragmented-message failures.

See ADR-012.

---

# Retrieval and RAG

## Real-World Insurance Language Gap

Observed that users frequently describe concepts differently than policy documents.

Example:

User:

"What is the waiting period for diabetes?"

Policy:

"Pre-existing diseases are subject to a waiting period."

Literal retrieval often missed relevant clauses.

Outcome:

Introduced category-level reasoning and concept mapping.

See ADR-010.

---

## Knowledge Separation

Discovered that policy documents and insurance knowledge solve different problems.

Policy documents answer:

* What is covered?
* What are my limits?

Insurance knowledge answers:

* What is co-payment?
* What is a deductible?
* What rights do policyholders have?

Outcome:

Separated policy knowledge from insurance domain knowledge.

See ADR-009.

---

# Product Design

## Global Chat Requirement

Early product thinking revealed that many users would want insurance guidance before uploading a policy document.

Examples:

* Understanding insurance terminology.
* Learning about claims.
* Understanding policyholder rights.

Forcing document upload would create unnecessary friction.

Outcome:

Introduced Global Chat alongside Document Chat.

See ADR-006.
