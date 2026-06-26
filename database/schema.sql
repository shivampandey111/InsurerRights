CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- create enums

CREATE TYPE visibility_type AS ENUM (
    'private',
    'global'
);

-- Documents Table

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID references auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat History Table

CREATE TABLE chat_history(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID references auth.users(id) ON DELETE CASCADE,
  doc_id UUID references documents(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Chats Table

CREATE TABLE global_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID references auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doc Chunks Table 

CREATE TABLE document_chunks(
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL references documents(id) ON DELETE CASCADE,
  user_id UUID references auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1024) NOT NULL,
  visibility visibility_type DEFAULT 'private',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE INDEX idx_documents_user
ON documents(user_id);

-- Chunks
CREATE INDEX idx_chunks_doc
ON document_chunks(doc_id);

CREATE INDEX idx_chunks_user
ON document_chunks(user_id);

-- Chat History 
CREATE INDEX idx_chat_doc
ON chat_history(doc_id);

CREATE INDEX idx_chat_user
ON chat_history(user_id);

-- Vector Index
CREATE INDEX idx_chunks_embedding
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Remote Procedure Call (RPC) Function

CREATE OR REPLACE FUNCTION match_document_chunks(
    query VECTOR(1024),
    user_id_filter UUID, 
    doc_id_filter UUID,
    match_count INT,
    match_threshold FLOAT
)
RETURNS TABLE (
    content TEXT, 
    similarity FLOAT
)
LANGUAGE sql
AS $$ 
SELECT
    dc.content,
    1 - (dc.embedding <=> query) AS similarity
FROM document_chunks dc
WHERE
    (
        (
            dc.doc_id = doc_id_filter
            AND
            dc.user_id = user_id_filter
            AND
            dc.visibility = 'private'
        )
        OR
        (
            dc.visibility = 'global'
        )
    )
    AND 
    (1 - (dc.embedding <=> query)) >= match_threshold
ORDER BY dc.embedding <=> query
LIMIT match_count;
$$;
