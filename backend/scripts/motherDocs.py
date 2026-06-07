from backend.supaBase import get_supabase
from backend.services.pdf_service import get_chunks, extract_content_from_pdf
from backend.services.embedding_service import get_embeds
from pathlib import Path
import uuid
supabase = get_supabase()

# Read the files as bytes
pdf_files = Path("backend\scripts").glob("*.pdf")

for pdf_file in pdf_files:
    with open(pdf_file, "rb") as f:
        file_bytes = f.read()

    content = extract_content_from_pdf(file_bytes)
    chunk = get_chunks(content)
    
    # Storing the documents
    doc_id = str(uuid.uuid4())
    supabase.table("documents").insert({
        "id" : doc_id,
        "user_id" : None,
        "filename" : pdf_file.name,
        "chunk_count" : len(chunk)
    }).execute()
    
    embed = get_embeds(chunk)

    # Storing the vectors (embeds)
    rows = [{
        "doc_id" : doc_id,
        "user_id" : None,
        "content" : chunk,
        "embedding" : embed,
        "visibility" : "global"
    } for chunk, embed in zip(chunk, embed)] 
    supabase.table("document_chunks").insert(rows).execute()

    


