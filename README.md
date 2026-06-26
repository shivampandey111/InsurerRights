# Insurer Rights

**Your policy is 60 pages. Your claim was rejected in one line.**

An AI-powered platform that gives Indian policyholders the same information advantage their insurers have. Upload a policy PDF, ask plain-language questions about coverage, exclusions, and claim rights — grounded in the actual document and IRDAI regulations.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![LangChain](https://img.shields.io/badge/LangChain-LCEL-1C3C3C?style=flat-square)](https://python.langchain.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

---

![Demo](docs/demo.gif)

---

## Overview

Insurance policies in India are written for actuaries, not policyholders. Claim rejections happen on clause interpretations the policyholder never understood. IRDAI publishes guidelines that most policyholders never read — or know exist.

Insurer Rights makes that asymmetry a solved problem.

- **Policy Decoder** :- Upload any insurance PDF. Get plain-language answers about what's covered, what's excluded, and what the sub-limits actually mean.
- **IRDAI Global Assistant** :- Query three curated IRDAI regulatory documents without uploading anything. Know your rights before you buy.
- **Dual retrieval modes** :- Document-specific chat stays scoped to your policy. The global assistant queries only verified regulatory sources. Same pipeline, enforced by pgvector metadata filters — not prompt engineering.

---

## Architecture

```
                        ┌─────────────────────────────────────┐
CLIENT LAYER            │           React + Vite               │
                        │  Auth · Dashboard · Chat · SSE UI    │
                        └────────────────┬────────────────────┘
                                         │ JWT  /  SSE stream
                        ┌────────────────▼────────────────────┐
APPLICATION LAYER       │           FastAPI (Python)           │
                        │  Depends(get_current_user)           │
                        │  ┌──────────────┐ ┌──────────────┐  │
                        │  │ PDF Ingestion│ │  RAG Query   │  │
                        │  │ PyMuPDF      │ │  LCEL chain  │  │
                        │  │ + pdfplumber │ │  chain.astr..│  │
                        │  └──────┬───────┘ └──────┬───────┘  │
                        └─────────┼────────────────┼──────────┘
                                  │                │
                        ┌─────────▼────────────────▼──────────┐
DATA LAYER              │           Supabase (Postgres)        │
                        │  pgvector · chat_history · documents │
                        └─────────────────────────────────────┘
                                         │
                        ┌────────────────▼────────────────────┐
EXTERNAL APIs           │          Google Gemini               │
                        │  text-embedding-002 · 3.5 Flash      │
                        └─────────────────────────────────────┘
```

**Ingestion flow:** PDF upload → two-pass extraction (PyMuPDF text + pdfplumber tables) → insurance-aware chunking → Gemini embeddings (batched, rate-limit-safe) → pgvector with `doc_id` / `visibility` metadata

**Query flow:** User query → embed → pgvector RPC similarity search → last 4 chat turns from `chat_history` → LangChain LCEL chain → `chain.astream()` → SSE `StreamingResponse` → React

---

## Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | — |
| Backend | FastAPI (Python) | Native async, native AI library support |
| Vector store | Supabase pgvector | Persistent — survives Render restarts unlike FAISS/Chroma |
| Embeddings | Gemini `text-embedding-002` (1024 dims) | Free tier, quality competitive with Ada-002 |
| LLM | Gemini 3.5 Flash via `ChatGoogleGenerativeAI` | Free tier, fast |
| RAG orchestration | LangChain LCEL pipe operator | Composable, streamable |
| PDF extraction | PyMuPDF + pdfplumber (hybrid) | See ADR-002 |
| Auth | Supabase JWT via FastAPI `Depends()` | Identity from signed token, never from request body |
| Deployment | Render (backend) · Vercel (frontend) | — |

---

## PDF Table Extraction

Insurance documents are table-heavy — sub-limits, waiting periods, coverage schedules. Standard text extraction flattens these, destroying row-column relationships. This project uses a two-pass approach:

1. **PyMuPDF** — full text extraction, fast
2. **pdfplumber** — structured table extraction on every page

Tables are converted to `Header: Value | Header: Value` format and stored as single chunks with a `[TABLE]` prefix, preserving semantics through the embedding step. Merged cells (which return `None` in pdfplumber) are handled by tracking `last_row_label` across rows.

---

## Local Development

### Prerequisites

- Python 3.11+
- Node 18+
- Supabase project with pgvector enabled
- Gemini API key

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in keys
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in keys
npm run dev
```

### Supabase Setup

Run the schema in `database/schema.sql` against your Supabase project, then execute the `match_document_chunks` RPC function.

---

## Environment Variables

### Backend (`backend/.env`)

```
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=          # anon key
SUPABASE_SERVICE_KEY=  # service role key — never expose to frontend
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Architectural Decision Records

12 ADRs in [`docs/adr/`](docs/adr/) cover every non-obvious decision in this codebase:

| ADR | Decision |
|---|---|
| ADR-001 | pgvector over Chroma/FAISS |
| ADR-002 | Hybrid PDF extraction (PyMuPDF + pdfplumber) |
| ADR-003 | JWT auth via FastAPI `Depends()` |
| ADR-004 | Feature-based FastAPI architecture |
| ADR-005 | Unified Supabase data layer |
| ADR-006 | Dual conversation mode (doc-specific vs global) |
| ADR-007 | Insurance-aware chunking separators |
| ADR-008 | Hybrid retrieval with metadata filters |
| ADR-009 | Separation of user knowledge and regulatory knowledge |
| ADR-010 | Category-level reasoning in prompt design |
| ADR-011 | SSE over WebSockets for streaming |
| ADR-012 | Buffered parsing for streaming responses |

---

## Project Structure

### 📂 Backend Structure

```text
backend/
├── routers/                     # FastAPI route handlers
│   ├── admin_upload.py          # Upload and process global (admin) documents
│   ├── auth.py                  # Authentication endpoints
│   ├── dependencies.py          # Shared dependencies (JWT verification, user auth, etc.)
│   ├── docs.py                  # Document management (fetch, delete, metadata)
│   ├── globalChat.py            # Global insurance assistant endpoints
│   ├── history.py               # Chat history endpoints
│   ├── query.py                 # RAG query and streaming response endpoints
│   └── upload.py                # User document upload endpoint
│
├── services/                    # Core business logic
│   ├── embedding_service.py     # Generates embeddings using Gemini
│   ├── global_chat_service.py   # Handles global assistant responses
│   ├── pdf_service.py           # PDF extraction, chunking, preprocessing
│   └── rag_service.py           # Retrieval-Augmented Generation pipeline
│
├── scripts/                     # Utility and setup scripts
│   ├── Exception/               # Custom exception handling
│   ├── Aarogya.pdf              # Mother document
│   ├── Handbook on Insurance.pdf
│   ├── Health Insurance Portability.pdf
│   └── motherDocs.py            # Script to ingest global insurance documents
│
├── .env                         # Environment variables
├── .env.example                 # Example environment configuration
├── main.py                      # FastAPI application entry point
├── requirements.txt             # Python dependencies
└── supaBase.py                  # Supabase client configuration

```

### 📂 Documentation

```text
docs/
├── adr/
│   ├── ADR-001 → ADR-012          # Decisions covering vector storage, PDF processing,
│   │                              # authentication, backend architecture, data layer,
│   │                              # RAG pipeline, retrieval, reasoning, and streaming
│   ├── ADR_INDEX.md
│   └── ENGINEERING_NOTES.md
│
└── database/
    └── schema.sql
```

### 📂 Frontend Structure

```text
frontend/
├── src/
│   ├── components/                 # Reusable UI and authentication components
│   │   ├── Auth.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   └── useAuth.js
│   │
│   ├── pages/                      # Main application pages
│   │   ├── LandingPage.jsx         # Home page
│   │   ├── PrimaryDashboard.jsx    # Main dashboard layout
│   │   ├── Dashboard.jsx           # Document management
│   │   ├── Chat.jsx                # Document-specific AI chat
│   │   ├── GlobalChat.jsx          # Global insurance assistant
│   │   └── SideBar.jsx             # Navigation sidebar
│   │
│   ├── App.jsx                     # Root application component
│   ├── main.jsx                    # React entry point
│   ├── supabaseClient.js           # Supabase client configuration
│   ├── App.css
│   └── index.css
│
├── .env                            # Environment variables
├── .gitignore
├── eslint.config.js                # ESLint configuration
├── index.html                      # Vite HTML template
├── package.json                    # Project metadata & dependencies
├── package-lock.json
├── vercel.json                     # Vercel deployment configuration
├── README.md
└── notes.md                        # Development notes
```

---

## Deployment Notes

**Render (backend):**
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Free tier cold starts after inactivity (~30-50s). The frontend shows a "connecting…" state during this.

**Vercel (frontend):**
- Root directory: `frontend`
- Framework preset: Vite

After both are live, update `allow_origins` in `main.py` to the Vercel deployment URL.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

This project builds upon several excellent open-source technologies.

Special thanks to the teams behind:

- **FastAPI** — asynchronous Python web framework
- **React** and **Vite** — modern frontend development
- **Supabase** — PostgreSQL, Authentication, and pgvector
- **LangChain LCEL** — composable Retrieval-Augmented Generation pipelines
- **Google Gemini** — embeddings and language model
- **PyMuPDF** and **pdfplumber** — PDF extraction
- **Tailwind CSS** — utility-first frontend styling

Their work makes building production-grade AI applications significantly more accessible.

---

## Known Limitations

### API Rate Limits

This project currently relies on hosted embedding and language model APIs.

Large documents may generate hundreds of embedding chunks during ingestion. When API rate limits or quotas are reached:

- New document uploads cannot be indexed until the quota resets.
- Query embeddings may be temporarily unavailable.
- Retrieval performance is unaffected for documents that have already been indexed.

The ingestion pipeline batches embedding requests and includes rate-limit handling, but available throughput ultimately depends on the configured API provider.

### Large Documents

Very large policy documents can produce hundreds or thousands of chunks depending on their structure.

Although embeddings are generated in batches, indexing extremely large PDFs may take additional time and, on free API tiers, may exceed the available quota.

Production deployments should consider:

- Using higher API quotas.
- Background ingestion with retry queues.
- Document size or chunk-count limits.
- Alternative embedding providers.

### Scanned PDFs

The ingestion pipeline extracts text using **PyMuPDF** and **pdfplumber**, and therefore requires digitally searchable PDFs.

Image-based or scanned documents currently require an OCR pipeline, which is planned for a future release.

### Table Extraction

Insurance policies frequently contain complex tables with merged cells and irregular layouts.

The hybrid extraction pipeline preserves most table structures, but highly complex formatting may still reduce retrieval quality.

---

## Roadmap

The current release focuses on solving the core problem: helping policyholders understand their insurance policies.

### Document Intelligence

- [ ] OCR support for scanned PDFs
- [ ] Highlight retrieved passages directly inside the PDF
- [ ] Better handling of complex tables and nested layouts
- [ ] Support for additional policy formats

### Retrieval & AI

- [ ] Cross-document policy comparison
- [ ] Reranking layer for higher retrieval precision
- [ ] Hybrid keyword + semantic retrieval
- [ ] Citation-aware responses with page references

### Product Features

- [ ] Claim rejection analyzer
- [ ] Guided claim filing assistant
- [ ] Policy renewal recommendations
- [ ] Multi-policy workspace
- [ ] Conversation export

---

## Contributing

Contributions, discussions, and suggestions are welcome.

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Follow the existing project structure and coding style.
4. Update relevant documentation where necessary.
5. Open a Pull Request describing the motivation behind your changes.

For significant architectural changes, consider adding or updating the relevant Architectural Decision Record (ADR) before submitting your pull request.

---

## Security

If you discover a security vulnerability, please avoid creating a public issue.

Instead, report it privately with sufficient details to reproduce the issue. Responsible disclosure helps keep users and deployments secure.

---

## Disclaimer

Insurer Rights is an educational and informational platform.

While every response is grounded in uploaded policy documents and curated IRDAI publications, the application **does not provide legal, financial, or professional insurance advice**.

Always verify important decisions against the original policy wording and consult a qualified professional where appropriate.

---

## Author

**[Shivam Pandey](https://www.linkedin.com/in/shivampandey111/)** 

Built as a capstone project exploring production-grade AI engineering, Retrieval-Augmented Generation (RAG), document intelligence, and scalable backend architecture.

The project emphasizes engineering decisions over framework complexity, with every major architectural choice documented through Architectural Decision Records (ADRs).

---

## Support

If you found this project useful:

- ⭐ Star the repository
- Report bugs or suggest improvements through Issues
- Share feedback and ideas for future features

Community feedback helps improve the project for everyone.
```
