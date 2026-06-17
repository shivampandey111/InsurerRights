from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from backend.supaBase import get_supabase
from backend.services.pdf_service import extract_content_from_pdf, get_chunks
from backend.services.embedding_service import get_embeds
from backend.routers.dependencies import get_current_user
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

@router.post('/api/upload')
async def upload_pdf(
    file: UploadFile = File(...), 
    user_id = Depends(get_current_user)
):
    # Validate the type and size of the file
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only pdf files are expected")
    
    file_bytes = await file.read()  # The return type is bytes
    if len(file_bytes) > 15 * 1024 * 1024:
        raise HTTPException(401, "Max file size allowed is 10mb")

    # Extract and Chunk
    text = extract_content_from_pdf(file_bytes)
    chunk = get_chunks(text)

    # Get Storage Consumed 
    estimated_storage = get_storage_used(chunk)
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
        if estimated_storage + current_storage > LIMIT_MB:
            print(estimated_storage)
            print(current_storage)
            raise HTTPException(
                status_code=400,
                detail="Storage Excedded"
            )
    except Exception as e:
        print(type(e))
        raise HTTPException(400, str(e))
        
    # Get Embeddings
    embedding = get_embeds(chunk)

    # Store the document
    doc_id = str(uuid.uuid4())
    supabase.table("documents").insert({
        "id" : doc_id,
        "user_id" : user_id,
        "filename" : file.filename,
        "chunk_count" : len(chunk),
        "storage_used_mb" : estimated_storage
    }).execute()

    # Store the vectors
    rows = [{
        "doc_id" : doc_id,
        "user_id" : user_id,
        "content" : chunk,
        "embedding" : embedding,
        "visibility" : "private"
    } for chunk, embedding in zip(chunk, embedding)]
    supabase.table("document_chunks").insert(rows).execute()

    return {
        "doc_id" : doc_id,
        "chunks" : len(chunk)
    }
