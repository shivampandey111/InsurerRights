# ADR-011: Buffered SSE Parsing for Reliable Token Streaming

Status: Accepted
Date: 2026-06-19

## Context

Insurer Rights uses Server-Sent Events (SSE) to stream LLM responses
from the backend to the frontend.

Initial frontend implementation assumed that each network chunk
contained a complete SSE event.

Example assumption:

```text
data: {"token":"Hello"}
```

However, network transport does not guarantee that SSE messages arrive as complete units.

A single SSE event may be split across multiple network chunks:

```text
Chunk 1:
data: {"tok

Chunk 2:
en":"Hello"}
```

When this occurred, JSON parsing failed and portions of responses were lost or delayed.

The issue became more visible during longer responses and slower network conditions.

The streaming layer therefore required a mechanism that could tolerate partial message delivery.

---

## Decision

Adopt a buffered SSE parsing strategy on the frontend.

Instead of attempting to parse each network chunk immediately, incoming data is accumulated in a buffer until a complete SSE event is detected.

Architecture:

```text
Network Chunk
      ↓
Buffer
      ↓
Complete SSE Event?
      ↓
     Yes
      ↓
JSON Parse
      ↓
Render Token
```

Incomplete messages remain in the buffer until sufficient data arrives.

---

## Alternatives Considered

### Direct Chunk Parsing

#### Pros

- Simple implementation
- Minimal memory usage

#### Cons

- Vulnerable to chunk fragmentation
- JSON parse failures
- Unreliable streaming behavior

**Decision:** Rejected

---

### Buffered SSE Parsing

#### Pros

- Handles fragmented network packets
- More reliable token delivery
- Better user experience
- Robust against transport variability

#### Cons

- Additional implementation complexity
- Slight increase in memory usage

**Decision:** Accepted

---

## Consequences

### Positive

- Reliable token streaming.
- Reduced parsing failures.
- Consistent frontend behavior.
- Better handling of long responses.
- Improved resilience to network conditions.

### Negative

- More complex frontend streaming logic.
- Additional buffer management requirements.

---

## Rationale

Network chunk boundaries are transport-level concerns and should not be treated as message boundaries.

The frontend should process complete SSE events rather than raw network chunks.

Buffered parsing ensures that message processing remains reliable
regardless of how the underlying transport delivers data.

The architecture therefore prioritizes correctness and reliability over implementation simplicity.

---

## Related ADRs

- ADR-010: Use Server-Sent Events (SSE) for Response Streaming