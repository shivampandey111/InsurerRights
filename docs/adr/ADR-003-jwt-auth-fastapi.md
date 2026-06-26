# ADR-003: JWT Authentication via FastAPI Dependency Injection

Status: Accepted
Date: 2026-06-30

## Context

Insurer Rights is a multi-user application where users can:

- Register and authenticate
- Upload insurance policy documents
- Query their documents through the RAG pipeline
- Maintain private chat history

Every uploaded document, vector embedding, and chat message must be
associated with the correct user.

The initial implementation considered accepting `user_id` as a request parameter or request body field on protected endpoints.

Example:

```json
{
  "user_id": "some-uuid",
  "question": "What is the waiting period?"
}
```

This approach introduces a security risk because clients can modify request data before sending it.

A malicious user could potentially provide another user's UUID and gain access to documents, embeddings, or chat history that do not belong to them.

The system therefore requires a mechanism that guarantees user identity cannot be forged by the client.

---

## Decision

Use JWT-based authentication with FastAPI Dependency Injection.

User identity is extracted from the authenticated JWT access token on
every protected endpoint.

The frontend never sends a `user_id` field.

Instead, requests include:

```http
Authorization: Bearer <access_token>
```

A shared FastAPI dependency validates the token through Supabase Auth
and returns the verified user identifier.

```python
user_id: str = Depends(get_current_user)
```

All protected routes receive the authenticated user identity through
dependency injection.

Examples:

```python
@router.post("/upload")
async def upload_pdf(
    file: UploadFile,
    user_id: str = Depends(get_current_user)
):
```

```python
@router.post("/query")
async def query_policy(
    req: QueryRequest,
    user_id: str = Depends(get_current_user)
):
```

---

## Alternatives Considered

### User ID Passed in Request Body

#### Pros

- Simple implementation
- Easy local testing
- No authentication dependency

#### Cons

- Insecure
- User identity can be forged
- No guarantee that data belongs to requesting user
- Violates standard API authentication practices

**Decision:** Rejected

---

### User ID Passed as Query Parameter

#### Pros

- Easy implementation
- Minimal backend logic

#### Cons

- Same security issues as request body approach
- User identity remains client-controlled
- Exposes identifiers in URLs

**Decision:** Rejected

---

### Session-Based Authentication

#### Pros

- Common web application pattern
- User identity managed server-side

#### Cons

- Requires session storage infrastructure
- Less suitable for stateless APIs
- Additional operational complexity

**Decision:** Rejected

---

### JWT Authentication via Dependency Injection

#### Pros

- Industry-standard API authentication pattern
- Stateless architecture
- Identity cannot be forged by clients
- Reusable authentication logic
- Consistent across all protected endpoints
- Works naturally with Supabase Auth

#### Cons

- Requires token validation on requests
- Slightly more implementation complexity

**Decision:** Accepted

---

## Consequences

### Positive

- User identity is cryptographically verified.
- Clients cannot impersonate other users.
- Authentication logic exists in a single reusable dependency.
- Protected endpoints remain clean and consistent.
- User isolation becomes automatic.
- Architecture remains stateless and scalable.

### Negative

- Every protected request requires token validation.
- Dependency must be maintained as authentication requirements evolve.
- Local testing requires valid authentication tokens.

---

## Rationale

User isolation is a fundamental requirement of the platform.

Documents, embeddings, and chat history contain user-specific data and must never be accessible across accounts.

Accepting user identifiers from request data places trust in the client, which is inherently insecure.

JWT authentication shifts trust to a cryptographically signed token
issued by the authentication provider. The backend verifies the token
and extracts the user identity directly from it.

By centralizing this logic inside a FastAPI dependency, authentication becomes reusable, consistent, and difficult to bypass.

The decision prioritizes security, correctness, and maintainability over implementation simplicity.

---

## Related ADRs

- ADR-001: Use pgvector as the Vector Store
- ADR-002: Hybrid PDF Extraction Using PyMuPDF and pdfplumber
- ADR-004: Server-Sent Events for Streaming Responses