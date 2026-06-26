# ADR-010: Use Server-Sent Events (SSE) for Response Streaming

Status: Accepted
Date: 2026-06-01

## Context

Insurer Rights generates responses using Retrieval-Augmented Generation (RAG) and Large Language Models.

LLM responses can take several seconds to complete, particularly when:

- Retrieving multiple policy chunks
- Combining policy and regulatory knowledge
- Generating detailed explanations
- Processing long conversational context

Waiting for the entire response before returning content creates a poor user experience and increases perceived latency.

The platform therefore requires incremental response delivery so users can begin reading answers as they are generated.

Several communication mechanisms were considered.

---

## Decision

Use Server-Sent Events (SSE) as the streaming mechanism between the
FastAPI backend and React frontend.

Architecture:

```text
User Question
      ↓
FastAPI Endpoint
      ↓
LLM Token Generation
      ↓
SSE Stream
      ↓
React Client
      ↓
Incremental Rendering
```

Backend implementation:

```python
StreamingResponse()
```

Frontend implementation:

```javascript
fetch()
ReadableStream
TextDecoder
```

Responses are streamed token-by-token from the model to the user
interface.

---

## Alternatives Considered

### Traditional Request-Response

#### Pros

- Simple implementation
- Broad compatibility

#### Cons

- High perceived latency
- No intermediate feedback
- Poor conversational experience

**Decision:** Rejected

---

### WebSockets

#### Pros

- Full duplex communication
- Real-time bidirectional messaging
- Suitable for collaborative applications

#### Cons

- More infrastructure complexity
- Additional connection management
- Unnecessary for one-way token streaming
- Higher implementation overhead

**Decision:** Rejected

---

### Server-Sent Events (SSE)

#### Pros

- Simple implementation
- Native HTTP support
- Ideal for one-way streaming
- Works naturally with LLM token generation
- Lower complexity than WebSockets

#### Cons

- Server-to-client only
- Less flexible than WebSockets

**Decision:** Accepted

---

## Consequences

### Positive

- Reduced perceived latency.
- Improved conversational experience.
- Users receive immediate feedback.
- Simpler architecture than WebSockets.
- Better alignment with LLM token generation.

### Negative

- Streaming state must be managed on both client and server.
- Additional frontend parsing logic required.
- More complex error handling than traditional responses.

---

## Rationale

The primary requirement is one-way delivery of generated content from
the backend to the frontend.

The application does not require bidirectional real-time communication, presence tracking, collaborative editing, or other capabilities that typically justify WebSockets.

Server-Sent Events provide the simplest architecture capable of
delivering incremental model output while maintaining a standard HTTP request lifecycle.

The architecture therefore prioritizes simplicity, reliability, and
user experience over communication flexibility.

---

## Related ADRs

- ADR-006: Dual Conversation Modes (Document Chat and Global Chat)
- ADR-008: Hybrid Retrieval Scope (Policy Documents and Regulatory Knowledge)