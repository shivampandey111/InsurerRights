from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from backend.routers.dependencies import get_current_user
from backend.routers.upload import process_file, store, store_vectors
from dotenv import load_dotenv
import os
load_dotenv()

router = APIRouter()

admin_id = os.getenv("ADMIN_USER_ID")

def get_admin_id(user_id):
    print(admin_id)
    if user_id != admin_id:
        raise HTTPException (403, detail="Admin Only")
    return user_id

@router.post('/admin/upload')
async def admin_upload(
    file : UploadFile = File(...),
    user_id : str = Depends(get_current_user)
):
    admin_id = get_admin_id(user_id=user_id)
    
    chunks, embeddings, size = await process_file(file)
    print(len(chunks))
    # Store doc meta data
    doc_id = store(
        user_id=admin_id,
        filename=file.filename,
        chunks=chunks,
        size=size
    )
    # Store vectors
    store_vectors(
        doc_id=doc_id,
        chunks=chunks,
        embeddings=embeddings,
        visibility='global',
        user_id=admin_id
    )
    return {
        "doc_id" : doc_id,
        "chunks" : len(chunks)
    }


