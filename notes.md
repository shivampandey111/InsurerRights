file_bytes: bytes

The function expects PDF data in binary form.

Normally PyMuPDF opens a PDF from a file path: doc = fitz.open("sample.pdf")

But in web applications like FastAPI, uploaded files are usually received as bytes in memory, not as files on disk.

Uploaded PDF
      ↓
file.read()
      ↓
PDF bytes
      ↓
fitz.open(stream=bytes)
      ↓
Document object
      ↓
Loop through pages
      ↓
Extract text
      ↓
Return text


##                                                    AUTH
This is exactly the right question to ask now. This is the core of how authenticated APIs work. Understand this pattern once and you'll use it in every backend you ever build.

---

## What's Actually Happening

When a user logs in via Supabase, they get back a **JWT access token**. That token is a signed string that contains the user's data baked inside it — including their `user_id` as the `sub` (subject) claim.

Every subsequent request from that user should send this token in the request header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Your FastAPI backend reads this header, verifies the token, extracts the `user_id` from inside it, and uses it. The frontend never manually passes a `user_id` field. The identity comes from the token itself.

This is how every production API handles identity. Not via a query param, not via a request body field — via the Authorization header.

---

## The Pattern — FastAPI Dependency Injection

FastAPI has a system called `Depends()`. You write a function that extracts and validates the token, and FastAPI automatically calls it before your endpoint runs and injects the result. Every protected endpoint gets the verified `user_id` without repeating the auth logic.

Create `dependencies.py` in your backend root:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
import os

security = HTTPBearer()

def get_supabase():
    return create_client(
        os.getenv("SUPABASE_URL"), 
        os.getenv("SUPABASE_SERVICE_KEY")
    )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase = Depends(get_supabase)
) -> str:
    """
    Extracts JWT from Authorization header, validates it with Supabase,
    returns the user_id (UUID string).
    Raises 401 if token is missing, expired, or invalid.
    """
    token = credentials.credentials  # the raw JWT string
    
    try:
        # Supabase validates the token and returns the user object
        response = supabase.auth.get_user(token)
        user = response.user
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        return str(user.id)  # this is the UUID — same one in your documents table
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
```

---

## Updated Upload Endpoint

Now your upload endpoint uses `Depends(get_current_user)` instead of taking `user_id` as a parameter. FastAPI calls `get_current_user` first, gets the verified UUID, and passes it in:

```python
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from dependencies import get_current_user
# remove get_supabase from here, import from dependencies

router = APIRouter()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)  # ← injected automatically
):
    # user_id is now the verified UUID from the JWT
    # no manual passing, no empty string, no trust issues
    
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files accepted")
    
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 10MB.")
    
    # rest of your ingestion code
    # user_id here is guaranteed to be the real UUID of whoever is logged in
```

Same pattern on your query endpoint:

```python
@router.post("/query")
async def query_policy(
    req: QueryRequest,
    user_id: str = Depends(get_current_user)
):
    # user_id is injected, remove it from QueryRequest body entirely
```

---

## How Multiple Users Are Isolated Automatically

User A logs in → gets JWT with `sub: "uuid-A"`
User B logs in → gets JWT with `sub: "uuid-B"`

User A uploads a PDF → `get_current_user` returns `uuid-A` → stored in `documents` table with `user_id = uuid-A` → chunks stored in `document_chunks` with `user_id = uuid-A`

User B uploads a PDF → `get_current_user` returns `uuid-B` → their rows get `user_id = uuid-B`

When User A queries → their `user_id` filters the vector search to only their chunks. User B's data is never touched. The isolation is automatic because the identity comes from the verified token, not from anything the client controls.

---

## For Local Testing — Don't Use Empty Strings

Don't test with empty user_id. Do this instead:

In Supabase dashboard → Authentication → Users → create a test user manually. Then in your `routers/auth.py`, hit your own login endpoint to get a real JWT. Copy it. In Swagger UI (`localhost:8000/docs`), click "Authorize" at the top right, paste `Bearer <your-token>`. Now every request you make in Swagger will send the real token and `get_current_user` will extract the real UUID.

That's how you test authenticated endpoints properly — not by bypassing auth, but by getting a real token once and using it.

---

## What to Add to DECISIONS.md

```
## Auth: JWT dependency injection via Depends()

Instead of passing user_id as a request body field (insecure — 
any client can send any UUID), extracted user identity from the 
JWT access token on every protected endpoint using FastAPI's 
Depends() system.

Pattern: get_current_user dependency validates token against 
Supabase auth.get_user(), returns verified UUID. Injected into 
upload, query, and all future protected endpoints.

Result: user isolation is automatic and unforgeable. The client 
cannot claim to be a different user because identity comes from 
the signed token, not from request data.
```
# Doc and doc_chunks table role
## What document_chunks Stores Per Row

```
id | doc_id | user_id | content | embedding | visibility
```

It stores chunks. Each row knows which doc it belongs to via `doc_id`. But `doc_id` is just a UUID — `550e8400-e29b-41d4-a716`. It tells you nothing about what document that is.

---

## The Problem Without documents Table

Say a user uploads 3 policies. Your frontend needs to show:

```
Your uploaded documents:
1. Star_Health_Comprehensive.pdf — uploaded 2 June
2. HDFC_ERGO_Optima.pdf — uploaded 3 June  
3. LIC_Jeevan_Anand.pdf — uploaded 4 June
```

Without the documents table, how do you get this list? You'd have to query `document_chunks`, do a `DISTINCT doc_id` — but that gives you 3 UUIDs. No filename. No date. No way to display anything meaningful to the user.

You'd be forced to store filename and created_at in **every single chunk row**. If a document has 200 chunks, you're storing the same filename 200 times. That's what normalization exists to prevent.

---

## What documents Table Actually Does

**1. Single source of truth for document metadata**

```sql
documents: filename, storage_path, chunk_count, created_at
```

Stored once per document. Not 200 times across chunks.

**2. Enables clean deletion via CASCADE**

```sql
-- User deletes their policy
DELETE FROM documents WHERE id = doc_id;
-- All 200 chunks in document_chunks are automatically deleted
-- because of ON DELETE CASCADE on the foreign key
```

Without documents table, to delete a document you'd have to:
```sql
DELETE FROM document_chunks WHERE doc_id = '550e8400...';
-- But how does the user trigger this? They know their filename, not the UUID.
```

**3. storage_path is not redundant**

If you store the original PDF in Supabase Storage (which you should — so users can re-download their policy), the path lives here. You need it if you ever want to reprocess the document, let the user download the original, or show a preview.

**4. chunk_count for validation**

When ingestion runs, you store how many chunks were created. If something fails mid-ingestion, chunk_count in documents vs actual rows in document_chunks tells you the ingestion was incomplete. Useful for debugging.

---

## The Actual Relationship

```
documents (1)  ──────────────────  document_chunks (many)
id (PK)                            doc_id (FK → documents.id)
filename                           content
storage_path                       embedding
chunk_count                        visibility
created_at
```

documents = the file itself. document_chunks = the file broken into searchable pieces.

This is standard one-to-many relational design. The parent table holds what describes the whole thing. The child table holds the individual pieces. You never want metadata about the whole document scattered across every child row.

# ROOT ISSUE

there's a slight problem, when running a specific file, python cannot find the module, but when doing the same in fastapi, there is no problem because it starts from root. How to fix this in python?

Run as module, start from absolute root

# In query.py 
get_current_user, first async await, then depend, first it was coroutine object is not serializable and then depend is not. 