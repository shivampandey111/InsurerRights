from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from backend.supaBase import get_supabase
from backend.services.pdf_service import extract_content_from_pdf, get_chunks
from backend.services.embedding_service import get_embeds
from backend.routers.dependencies import get_current_user
import uuid

router = APIRouter()

@router.post('/upload')
async def upload_pdf(
    file: UploadFile = File(...), 
    user_id = Depends(get_current_user)
):
    # Validate the type and size of the file
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only pdf files are expected")
    
    file_bytes = await file.read()  # The return type is bytes
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(401, "Max file size allowed is 10mb")

    # Extract and Chunk
    text = extract_content_from_pdf(file_bytes)
    chunk = get_chunks(text)

    # Get Embeddings
    embedding = get_embeds(chunk)

    # Store the document
    supabase = get_supabase()
    doc_id = str(uuid.uuid4())
    supabase.table("documents").insert({
        "id" : doc_id,
        "user_id" : user_id,
        "filename" : file.filename,
        "chunk_count" : len(chunk)
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
