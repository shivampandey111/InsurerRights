from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from supaBase import get_supabase
from services.pdf_service import extract_content_from_pdf, get_chunks
from services.embedding_service import get_embeds
from routers.dependencies import get_current_user
import uuid

router = APIRouter()
supabase = get_supabase()

def get_storage_used(chunks: list[str]) -> float:
    text_bytes = sum(
        len(chunk.encode("utf-8"))
        for chunk in chunks
    )
    embedding_bytes = len(chunks) * 1024 * 4
    total_bytes = embedding_bytes + text_bytes
    return round(
        total_bytes / (1024*1024), 2
    )

# Validate the type and size of the file
async def validate_file(file):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only pdf files are expected")

    file_bytes = await file.read()  # The return type is bytes
    if len(file_bytes) > 15 * 1024 * 1024:
        raise HTTPException(401, "Max file size allowed is 10mb")
    return file_bytes

# Process file
async def process_file(file):
    file_bytes = await validate_file(file)
    text = extract_content_from_pdf(file_bytes)
    chunk = get_chunks(text)
    estimated_storage = get_storage_used(chunk)
    embeddings = get_embeds(chunk)

    return chunk, embeddings, estimated_storage

# Store the doc meta data
def store(user_id, filename, chunks, size):
    doc_id = str(uuid.uuid4())
    supabase.table("documents").insert({
        "id" : doc_id,
        "user_id" : user_id,
        "filename" : filename,
        "chunk_count" : len(chunks),
        "storage_used_mb" : size
    }).execute()
    return doc_id

# Store vectors 
def store_vectors(doc_id, chunks, embeddings, visibility, user_id):
    rows = [{
        "doc_id" : doc_id,
        "user_id" : user_id,
        "content" : chunk,
        "embedding" : embedding,
        "visibility" : visibility
    } for chunk, embedding in zip(chunks, embeddings)]
    supabase.table("document_chunks").insert(rows).execute()

@router.post('/api/upload')
async def upload_pdf(
    file: UploadFile = File(...), 
    user_id = Depends(get_current_user)
):
    chunks, embeddings, size = await process_file(file)

    if(len(chunks)>500):
        raise HTTPException(413, detail=(f"The document is too large to process on this deployement" 
                                         f"({len(chunks)}) chunks. Maximum supported: 500 Chunks"))
    try:
        response = (
                supabase.table("documents")
                .select("storage_used_mb")
                .eq("user_id", user_id)
                .execute()
            )
        current_storage = sum(
                row["storage_used_mb"] or 0
                for row in response.data
            )
        LIMIT_MB = 50
        if size + current_storage > LIMIT_MB:
            raise HTTPException(
                status_code=400,
                detail="Storage Excedded"
            )
    except Exception as e:
        print(type(e))
        raise HTTPException(400, str(e))    
    filename = file.filename

    # Store the document meta data 
    doc_id = store(user_id=user_id, filename=filename, chunks=chunks, size=size)

    # Store the vectors
    store_vectors(doc_id=doc_id, 
                  chunks=chunks, embeddings=embeddings, visibility="private", user_id=user_id)
    return {
        "doc_id" : doc_id,
        "chunks" : len(chunks)
    }
